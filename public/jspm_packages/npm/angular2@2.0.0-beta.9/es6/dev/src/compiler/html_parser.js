/* */ 
"format cjs";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import { HtmlAttrAst, HtmlTextAst, HtmlElementAst } from './html_ast';
import { Injectable } from 'angular2/src/core/di';
import { HtmlTokenType, tokenizeHtml } from './html_lexer';
import { ParseError, ParseSourceSpan } from './parse_util';
import { getHtmlTagDefinition, getNsPrefix, mergeNsAndName } from './html_tags';
export class HtmlTreeError extends ParseError {
    constructor(elementName, span, msg) {
        super(span, msg);
        this.elementName = elementName;
    }
    static create(elementName, span, msg) {
        return new HtmlTreeError(elementName, span, msg);
    }
}
export class HtmlParseTreeResult {
    constructor(rootNodes, errors) {
        this.rootNodes = rootNodes;
        this.errors = errors;
    }
}
export let HtmlParser = class {
    parse(sourceContent, sourceUrl) {
        var tokensAndErrors = tokenizeHtml(sourceContent, sourceUrl);
        var treeAndErrors = new TreeBuilder(tokensAndErrors.tokens).build();
        return new HtmlParseTreeResult(treeAndErrors.rootNodes, tokensAndErrors.errors
            .concat(treeAndErrors.errors));
    }
};
HtmlParser = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], HtmlParser);
class TreeBuilder {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = -1;
        this.rootNodes = [];
        this.errors = [];
        this.elementStack = [];
        this._advance();
    }
    build() {
        while (this.peek.type !== HtmlTokenType.EOF) {
            if (this.peek.type === HtmlTokenType.TAG_OPEN_START) {
                this._consumeStartTag(this._advance());
            }
            else if (this.peek.type === HtmlTokenType.TAG_CLOSE) {
                this._consumeEndTag(this._advance());
            }
            else if (this.peek.type === HtmlTokenType.CDATA_START) {
                this._closeVoidElement();
                this._consumeCdata(this._advance());
            }
            else if (this.peek.type === HtmlTokenType.COMMENT_START) {
                this._closeVoidElement();
                this._consumeComment(this._advance());
            }
            else if (this.peek.type === HtmlTokenType.TEXT ||
                this.peek.type === HtmlTokenType.RAW_TEXT ||
                this.peek.type === HtmlTokenType.ESCAPABLE_RAW_TEXT) {
                this._closeVoidElement();
                this._consumeText(this._advance());
            }
            else {
                // Skip all other tokens...
                this._advance();
            }
        }
        return new HtmlParseTreeResult(this.rootNodes, this.errors);
    }
    _advance() {
        var prev = this.peek;
        if (this.index < this.tokens.length - 1) {
            // Note: there is always an EOF token at the end
            this.index++;
        }
        this.peek = this.tokens[this.index];
        return prev;
    }
    _advanceIf(type) {
        if (this.peek.type === type) {
            return this._advance();
        }
        return null;
    }
    _consumeCdata(startToken) {
        this._consumeText(this._advance());
        this._advanceIf(HtmlTokenType.CDATA_END);
    }
    _consumeComment(startToken) {
        this._advanceIf(HtmlTokenType.RAW_TEXT);
        this._advanceIf(HtmlTokenType.COMMENT_END);
    }
    _consumeText(token) {
        let text = token.parts[0];
        if (text.length > 0 && text[0] == '\n') {
            let parent = this._getParentElement();
            if (isPresent(parent) && parent.children.length == 0 &&
                getHtmlTagDefinition(parent.name).ignoreFirstLf) {
                text = text.substring(1);
            }
        }
        if (text.length > 0) {
            this._addToParent(new HtmlTextAst(text, token.sourceSpan));
        }
    }
    _closeVoidElement() {
        if (this.elementStack.length > 0) {
            let el = ListWrapper.last(this.elementStack);
            if (getHtmlTagDefinition(el.name).isVoid) {
                this.elementStack.pop();
            }
        }
    }
    _consumeStartTag(startTagToken) {
        var prefix = startTagToken.parts[0];
        var name = startTagToken.parts[1];
        var attrs = [];
        while (this.peek.type === HtmlTokenType.ATTR_NAME) {
            attrs.push(this._consumeAttr(this._advance()));
        }
        var fullName = getElementFullName(prefix, name, this._getParentElement());
        var selfClosing = false;
        // Note: There could have been a tokenizer error
        // so that we don't get a token for the end tag...
        if (this.peek.type === HtmlTokenType.TAG_OPEN_END_VOID) {
            this._advance();
            selfClosing = true;
            if (getNsPrefix(fullName) == null && !getHtmlTagDefinition(fullName).isVoid) {
                this.errors.push(HtmlTreeError.create(fullName, startTagToken.sourceSpan, `Only void and foreign elements can be self closed "${startTagToken.parts[1]}"`));
            }
        }
        else if (this.peek.type === HtmlTokenType.TAG_OPEN_END) {
            this._advance();
            selfClosing = false;
        }
        var end = this.peek.sourceSpan.start;
        var el = new HtmlElementAst(fullName, attrs, [], new ParseSourceSpan(startTagToken.sourceSpan.start, end));
        this._pushElement(el);
        if (selfClosing) {
            this._popElement(fullName);
        }
    }
    _pushElement(el) {
        if (this.elementStack.length > 0) {
            var parentEl = ListWrapper.last(this.elementStack);
            if (getHtmlTagDefinition(parentEl.name).isClosedByChild(el.name)) {
                this.elementStack.pop();
            }
        }
        var tagDef = getHtmlTagDefinition(el.name);
        var parentEl = this._getParentElement();
        if (tagDef.requireExtraParent(isPresent(parentEl) ? parentEl.name : null)) {
            var newParent = new HtmlElementAst(tagDef.parentToAdd, [], [el], el.sourceSpan);
            this._addToParent(newParent);
            this.elementStack.push(newParent);
            this.elementStack.push(el);
        }
        else {
            this._addToParent(el);
            this.elementStack.push(el);
        }
    }
    _consumeEndTag(endTagToken) {
        var fullName = getElementFullName(endTagToken.parts[0], endTagToken.parts[1], this._getParentElement());
        if (getHtmlTagDefinition(fullName).isVoid) {
            this.errors.push(HtmlTreeError.create(fullName, endTagToken.sourceSpan, `Void elements do not have end tags "${endTagToken.parts[1]}"`));
        }
        else if (!this._popElement(fullName)) {
            this.errors.push(HtmlTreeError.create(fullName, endTagToken.sourceSpan, `Unexpected closing tag "${endTagToken.parts[1]}"`));
        }
    }
    _popElement(fullName) {
        for (let stackIndex = this.elementStack.length - 1; stackIndex >= 0; stackIndex--) {
            let el = this.elementStack[stackIndex];
            if (el.name == fullName) {
                ListWrapper.splice(this.elementStack, stackIndex, this.elementStack.length - stackIndex);
                return true;
            }
            if (!getHtmlTagDefinition(el.name).closedByParent) {
                return false;
            }
        }
        return false;
    }
    _consumeAttr(attrName) {
        var fullName = mergeNsAndName(attrName.parts[0], attrName.parts[1]);
        var end = attrName.sourceSpan.end;
        var value = '';
        if (this.peek.type === HtmlTokenType.ATTR_VALUE) {
            var valueToken = this._advance();
            value = valueToken.parts[0];
            end = valueToken.sourceSpan.end;
        }
        return new HtmlAttrAst(fullName, value, new ParseSourceSpan(attrName.sourceSpan.start, end));
    }
    _getParentElement() {
        return this.elementStack.length > 0 ? ListWrapper.last(this.elementStack) : null;
    }
    _addToParent(node) {
        var parent = this._getParentElement();
        if (isPresent(parent)) {
            parent.children.push(node);
        }
        else {
            this.rootNodes.push(node);
        }
    }
}
function getElementFullName(prefix, localName, parentElement) {
    if (isBlank(prefix)) {
        prefix = getHtmlTagDefinition(localName).implicitNamespacePrefix;
        if (isBlank(prefix) && isPresent(parentElement)) {
            prefix = getNsPrefix(parentElement.name);
        }
    }
    return mergeNsAndName(prefix, localName);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF9wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF9wYXJzZXIudHMiXSwibmFtZXMiOlsiSHRtbFRyZWVFcnJvciIsIkh0bWxUcmVlRXJyb3IuY29uc3RydWN0b3IiLCJIdG1sVHJlZUVycm9yLmNyZWF0ZSIsIkh0bWxQYXJzZVRyZWVSZXN1bHQiLCJIdG1sUGFyc2VUcmVlUmVzdWx0LmNvbnN0cnVjdG9yIiwiSHRtbFBhcnNlciIsIkh0bWxQYXJzZXIucGFyc2UiLCJUcmVlQnVpbGRlciIsIlRyZWVCdWlsZGVyLmNvbnN0cnVjdG9yIiwiVHJlZUJ1aWxkZXIuYnVpbGQiLCJUcmVlQnVpbGRlci5fYWR2YW5jZSIsIlRyZWVCdWlsZGVyLl9hZHZhbmNlSWYiLCJUcmVlQnVpbGRlci5fY29uc3VtZUNkYXRhIiwiVHJlZUJ1aWxkZXIuX2NvbnN1bWVDb21tZW50IiwiVHJlZUJ1aWxkZXIuX2NvbnN1bWVUZXh0IiwiVHJlZUJ1aWxkZXIuX2Nsb3NlVm9pZEVsZW1lbnQiLCJUcmVlQnVpbGRlci5fY29uc3VtZVN0YXJ0VGFnIiwiVHJlZUJ1aWxkZXIuX3B1c2hFbGVtZW50IiwiVHJlZUJ1aWxkZXIuX2NvbnN1bWVFbmRUYWciLCJUcmVlQnVpbGRlci5fcG9wRWxlbWVudCIsIlRyZWVCdWlsZGVyLl9jb25zdW1lQXR0ciIsIlRyZWVCdWlsZGVyLl9nZXRQYXJlbnRFbGVtZW50IiwiVHJlZUJ1aWxkZXIuX2FkZFRvUGFyZW50IiwiZ2V0RWxlbWVudEZ1bGxOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUNMLFNBQVMsRUFDVCxPQUFPLEVBT1IsTUFBTSwwQkFBMEI7T0FFMUIsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FFbkQsRUFBVSxXQUFXLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBQyxNQUFNLFlBQVk7T0FFckUsRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMs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Q0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0ZBLENBQUNBO0lBQ0hBLENBQUNBO0lBRU9YLFdBQVdBLENBQUNBLFFBQWdCQTtRQUNsQ1ksR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsRUFBRUEsVUFBVUEsSUFBSUEsQ0FBQ0EsRUFBRUEsVUFBVUEsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDbEZBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1lBQ3ZDQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxJQUFJQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDeEJBLFdBQVdBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEdBQUdBLFVBQVVBLENBQUNBLENBQUNBO2dCQUN6RkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDZEEsQ0FBQ0E7WUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbERBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1lBQ2ZBLENBQUNBO1FBQ0hBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2ZBLENBQUNBO0lBRU9aLFlBQVlBLENBQUNBLFFBQW1CQTtRQUN0Q2EsSUFBSUEsUUFBUUEsR0FBR0EsY0FBY0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDcEVBLElBQUlBLEdBQUdBLEdBQUdBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLENBQUNBO1FBQ2xDQSxJQUFJQSxLQUFLQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNmQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxhQUFhQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoREEsSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDakNBLEtBQUtBLEdBQUdBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxHQUFHQSxHQUFHQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQTtRQUNsQ0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsV0FBV0EsQ0FBQ0EsUUFBUUEsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsZUFBZUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDL0ZBLENBQUNBO0lBRU9iLGlCQUFpQkE7UUFDdkJjLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ25GQSxDQUFDQTtJQUVPZCxZQUFZQSxDQUFDQSxJQUFhQTtRQUNoQ2UsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQzdCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM1QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7QUFDSGYsQ0FBQ0E7QUFFRCw0QkFBNEIsTUFBYyxFQUFFLFNBQWlCLEVBQ2pDLGFBQTZCO0lBQ3ZEZ0IsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLE1BQU1BLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsdUJBQXVCQSxDQUFDQTtRQUNqRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaERBLE1BQU1BLEdBQUdBLFdBQVdBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQzNDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtBQUMzQ0EsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFN0cmluZ1dyYXBwZXIsXG4gIHN0cmluZ2lmeSxcbiAgYXNzZXJ0aW9uc0VuYWJsZWQsXG4gIFN0cmluZ0pvaW5lcixcbiAgc2VyaWFsaXplRW51bSxcbiAgQ09OU1RfRVhQUlxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge0h0bWxBc3QsIEh0bWxBdHRyQXN0LCBIdG1sVGV4dEFzdCwgSHRtbEVsZW1lbnRBc3R9IGZyb20gJy4vaHRtbF9hc3QnO1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7SHRtbFRva2VuLCBIdG1sVG9rZW5UeXBlLCB0b2tlbml6ZUh0bWx9IGZyb20gJy4vaHRtbF9sZXhlcic7XG5pbXBvcnQge1BhcnNlRXJyb3IsIFBhcnNlTG9jYXRpb24sIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi9wYXJzZV91dGlsJztcbmltcG9ydCB7SHRtbFRhZ0RlZmluaXRpb24sIGdldEh0bWxUYWdEZWZpbml0aW9uLCBnZXROc1ByZWZpeCwgbWVyZ2VOc0FuZE5hbWV9IGZyb20gJy4vaHRtbF90YWdzJztcblxuZXhwb3J0IGNsYXNzIEh0bWxUcmVlRXJyb3IgZXh0ZW5kcyBQYXJzZUVycm9yIHtcbiAgc3RhdGljIGNyZWF0ZShlbGVtZW50TmFtZTogc3RyaW5nLCBzcGFuOiBQYXJzZVNvdXJjZVNwYW4sIG1zZzogc3RyaW5nKTogSHRtbFRyZWVFcnJvciB7XG4gICAgcmV0dXJuIG5ldyBIdG1sVHJlZUVycm9yKGVsZW1lbnROYW1lLCBzcGFuLCBtc2cpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnROYW1lOiBzdHJpbmcsIHNwYW46IFBhcnNlU291cmNlU3BhbiwgbXNnOiBzdHJpbmcpIHsgc3VwZXIoc3BhbiwgbXNnKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgSHRtbFBhcnNlVHJlZVJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByb290Tm9kZXM6IEh0bWxBc3RbXSwgcHVibGljIGVycm9yczogUGFyc2VFcnJvcltdKSB7fVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHRtbFBhcnNlciB7XG4gIHBhcnNlKHNvdXJjZUNvbnRlbnQ6IHN0cmluZywgc291cmNlVXJsOiBzdHJpbmcpOiBIdG1sUGFyc2VUcmVlUmVzdWx0IHtcbiAgICB2YXIgdG9rZW5zQW5kRXJyb3JzID0gdG9rZW5pemVIdG1sKHNvdXJjZUNvbnRlbnQsIHNvdXJjZVVybCk7XG4gICAgdmFyIHRyZWVBbmRFcnJvcnMgPSBuZXcgVHJlZUJ1aWxkZXIodG9rZW5zQW5kRXJyb3JzLnRva2VucykuYnVpbGQoKTtcbiAgICByZXR1cm4gbmV3IEh0bWxQYXJzZVRyZWVSZXN1bHQodHJlZUFuZEVycm9ycy5yb290Tm9kZXMsICg8UGFyc2VFcnJvcltdPnRva2Vuc0FuZEVycm9ycy5lcnJvcnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmNhdCh0cmVlQW5kRXJyb3JzLmVycm9ycykpO1xuICB9XG59XG5cbmNsYXNzIFRyZWVCdWlsZGVyIHtcbiAgcHJpdmF0ZSBpbmRleDogbnVtYmVyID0gLTE7XG4gIHByaXZhdGUgcGVlazogSHRtbFRva2VuO1xuXG4gIHByaXZhdGUgcm9vdE5vZGVzOiBIdG1sQXN0W10gPSBbXTtcbiAgcHJpdmF0ZSBlcnJvcnM6IEh0bWxUcmVlRXJyb3JbXSA9IFtdO1xuXG4gIHByaXZhdGUgZWxlbWVudFN0YWNrOiBIdG1sRWxlbWVudEFzdFtdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB0b2tlbnM6IEh0bWxUb2tlbltdKSB7IHRoaXMuX2FkdmFuY2UoKTsgfVxuXG4gIGJ1aWxkKCk6IEh0bWxQYXJzZVRyZWVSZXN1bHQge1xuICAgIHdoaWxlICh0aGlzLnBlZWsudHlwZSAhPT0gSHRtbFRva2VuVHlwZS5FT0YpIHtcbiAgICAgIGlmICh0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5UQUdfT1BFTl9TVEFSVCkge1xuICAgICAgICB0aGlzLl9jb25zdW1lU3RhcnRUYWcodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuVEFHX0NMT1NFKSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVFbmRUYWcodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuQ0RBVEFfU1RBUlQpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lQ2RhdGEodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuQ09NTUVOVF9TVEFSVCkge1xuICAgICAgICB0aGlzLl9jbG9zZVZvaWRFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVDb21tZW50KHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLlRFWFQgfHxcbiAgICAgICAgICAgICAgICAgdGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuUkFXX1RFWFQgfHxcbiAgICAgICAgICAgICAgICAgdGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuRVNDQVBBQkxFX1JBV19URVhUKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlVm9pZEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fY29uc3VtZVRleHQodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNraXAgYWxsIG90aGVyIHRva2Vucy4uLlxuICAgICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgSHRtbFBhcnNlVHJlZVJlc3VsdCh0aGlzLnJvb3ROb2RlcywgdGhpcy5lcnJvcnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWR2YW5jZSgpOiBIdG1sVG9rZW4ge1xuICAgIHZhciBwcmV2ID0gdGhpcy5wZWVrO1xuICAgIGlmICh0aGlzLmluZGV4IDwgdGhpcy50b2tlbnMubGVuZ3RoIC0gMSkge1xuICAgICAgLy8gTm90ZTogdGhlcmUgaXMgYWx3YXlzIGFuIEVPRiB0b2tlbiBhdCB0aGUgZW5kXG4gICAgICB0aGlzLmluZGV4Kys7XG4gICAgfVxuICAgIHRoaXMucGVlayA9IHRoaXMudG9rZW5zW3RoaXMuaW5kZXhdO1xuICAgIHJldHVybiBwcmV2O1xuICB9XG5cbiAgcHJpdmF0ZSBfYWR2YW5jZUlmKHR5cGU6IEh0bWxUb2tlblR5cGUpOiBIdG1sVG9rZW4ge1xuICAgIGlmICh0aGlzLnBlZWsudHlwZSA9PT0gdHlwZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkdmFuY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lQ2RhdGEoc3RhcnRUb2tlbjogSHRtbFRva2VuKSB7XG4gICAgdGhpcy5fY29uc3VtZVRleHQodGhpcy5fYWR2YW5jZSgpKTtcbiAgICB0aGlzLl9hZHZhbmNlSWYoSHRtbFRva2VuVHlwZS5DREFUQV9FTkQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUNvbW1lbnQoc3RhcnRUb2tlbjogSHRtbFRva2VuKSB7XG4gICAgdGhpcy5fYWR2YW5jZUlmKEh0bWxUb2tlblR5cGUuUkFXX1RFWFQpO1xuICAgIHRoaXMuX2FkdmFuY2VJZihIdG1sVG9rZW5UeXBlLkNPTU1FTlRfRU5EKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVUZXh0KHRva2VuOiBIdG1sVG9rZW4pIHtcbiAgICBsZXQgdGV4dCA9IHRva2VuLnBhcnRzWzBdO1xuICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDAgJiYgdGV4dFswXSA9PSAnXFxuJykge1xuICAgICAgbGV0IHBhcmVudCA9IHRoaXMuX2dldFBhcmVudEVsZW1lbnQoKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocGFyZW50KSAmJiBwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoID09IDAgJiZcbiAgICAgICAgICBnZXRIdG1sVGFnRGVmaW5pdGlvbihwYXJlbnQubmFtZSkuaWdub3JlRmlyc3RMZikge1xuICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRleHQubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fYWRkVG9QYXJlbnQobmV3IEh0bWxUZXh0QXN0KHRleHQsIHRva2VuLnNvdXJjZVNwYW4pKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jbG9zZVZvaWRFbGVtZW50KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmVsZW1lbnRTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICBsZXQgZWwgPSBMaXN0V3JhcHBlci5sYXN0KHRoaXMuZWxlbWVudFN0YWNrKTtcblxuICAgICAgaWYgKGdldEh0bWxUYWdEZWZpbml0aW9uKGVsLm5hbWUpLmlzVm9pZCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRTdGFjay5wb3AoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lU3RhcnRUYWcoc3RhcnRUYWdUb2tlbjogSHRtbFRva2VuKSB7XG4gICAgdmFyIHByZWZpeCA9IHN0YXJ0VGFnVG9rZW4ucGFydHNbMF07XG4gICAgdmFyIG5hbWUgPSBzdGFydFRhZ1Rva2VuLnBhcnRzWzFdO1xuICAgIHZhciBhdHRycyA9IFtdO1xuICAgIHdoaWxlICh0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5BVFRSX05BTUUpIHtcbiAgICAgIGF0dHJzLnB1c2godGhpcy5fY29uc3VtZUF0dHIodGhpcy5fYWR2YW5jZSgpKSk7XG4gICAgfVxuICAgIHZhciBmdWxsTmFtZSA9IGdldEVsZW1lbnRGdWxsTmFtZShwcmVmaXgsIG5hbWUsIHRoaXMuX2dldFBhcmVudEVsZW1lbnQoKSk7XG4gICAgdmFyIHNlbGZDbG9zaW5nID0gZmFsc2U7XG4gICAgLy8gTm90ZTogVGhlcmUgY291bGQgaGF2ZSBiZWVuIGEgdG9rZW5pemVyIGVycm9yXG4gICAgLy8gc28gdGhhdCB3ZSBkb24ndCBnZXQgYSB0b2tlbiBmb3IgdGhlIGVuZCB0YWcuLi5cbiAgICBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuVEFHX09QRU5fRU5EX1ZPSUQpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHNlbGZDbG9zaW5nID0gdHJ1ZTtcbiAgICAgIGlmIChnZXROc1ByZWZpeChmdWxsTmFtZSkgPT0gbnVsbCAmJiAhZ2V0SHRtbFRhZ0RlZmluaXRpb24oZnVsbE5hbWUpLmlzVm9pZCkge1xuICAgICAgICB0aGlzLmVycm9ycy5wdXNoKEh0bWxUcmVlRXJyb3IuY3JlYXRlKFxuICAgICAgICAgICAgZnVsbE5hbWUsIHN0YXJ0VGFnVG9rZW4uc291cmNlU3BhbixcbiAgICAgICAgICAgIGBPbmx5IHZvaWQgYW5kIGZvcmVpZ24gZWxlbWVudHMgY2FuIGJlIHNlbGYgY2xvc2VkIFwiJHtzdGFydFRhZ1Rva2VuLnBhcnRzWzFdfVwiYCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuVEFHX09QRU5fRU5EKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBzZWxmQ2xvc2luZyA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgZW5kID0gdGhpcy5wZWVrLnNvdXJjZVNwYW4uc3RhcnQ7XG4gICAgdmFyIGVsID0gbmV3IEh0bWxFbGVtZW50QXN0KGZ1bGxOYW1lLCBhdHRycywgW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQYXJzZVNvdXJjZVNwYW4oc3RhcnRUYWdUb2tlbi5zb3VyY2VTcGFuLnN0YXJ0LCBlbmQpKTtcbiAgICB0aGlzLl9wdXNoRWxlbWVudChlbCk7XG4gICAgaWYgKHNlbGZDbG9zaW5nKSB7XG4gICAgICB0aGlzLl9wb3BFbGVtZW50KGZ1bGxOYW1lKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wdXNoRWxlbWVudChlbDogSHRtbEVsZW1lbnRBc3QpIHtcbiAgICBpZiAodGhpcy5lbGVtZW50U3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHBhcmVudEVsID0gTGlzdFdyYXBwZXIubGFzdCh0aGlzLmVsZW1lbnRTdGFjayk7XG4gICAgICBpZiAoZ2V0SHRtbFRhZ0RlZmluaXRpb24ocGFyZW50RWwubmFtZSkuaXNDbG9zZWRCeUNoaWxkKGVsLm5hbWUpKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudFN0YWNrLnBvcCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciB0YWdEZWYgPSBnZXRIdG1sVGFnRGVmaW5pdGlvbihlbC5uYW1lKTtcbiAgICB2YXIgcGFyZW50RWwgPSB0aGlzLl9nZXRQYXJlbnRFbGVtZW50KCk7XG4gICAgaWYgKHRhZ0RlZi5yZXF1aXJlRXh0cmFQYXJlbnQoaXNQcmVzZW50KHBhcmVudEVsKSA/IHBhcmVudEVsLm5hbWUgOiBudWxsKSkge1xuICAgICAgdmFyIG5ld1BhcmVudCA9IG5ldyBIdG1sRWxlbWVudEFzdCh0YWdEZWYucGFyZW50VG9BZGQsIFtdLCBbZWxdLCBlbC5zb3VyY2VTcGFuKTtcbiAgICAgIHRoaXMuX2FkZFRvUGFyZW50KG5ld1BhcmVudCk7XG4gICAgICB0aGlzLmVsZW1lbnRTdGFjay5wdXNoKG5ld1BhcmVudCk7XG4gICAgICB0aGlzLmVsZW1lbnRTdGFjay5wdXNoKGVsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYWRkVG9QYXJlbnQoZWwpO1xuICAgICAgdGhpcy5lbGVtZW50U3RhY2sucHVzaChlbCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUVuZFRhZyhlbmRUYWdUb2tlbjogSHRtbFRva2VuKSB7XG4gICAgdmFyIGZ1bGxOYW1lID1cbiAgICAgICAgZ2V0RWxlbWVudEZ1bGxOYW1lKGVuZFRhZ1Rva2VuLnBhcnRzWzBdLCBlbmRUYWdUb2tlbi5wYXJ0c1sxXSwgdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpKTtcblxuICAgIGlmIChnZXRIdG1sVGFnRGVmaW5pdGlvbihmdWxsTmFtZSkuaXNWb2lkKSB7XG4gICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICAgIEh0bWxUcmVlRXJyb3IuY3JlYXRlKGZ1bGxOYW1lLCBlbmRUYWdUb2tlbi5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBWb2lkIGVsZW1lbnRzIGRvIG5vdCBoYXZlIGVuZCB0YWdzIFwiJHtlbmRUYWdUb2tlbi5wYXJ0c1sxXX1cImApKTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9wb3BFbGVtZW50KGZ1bGxOYW1lKSkge1xuICAgICAgdGhpcy5lcnJvcnMucHVzaChIdG1sVHJlZUVycm9yLmNyZWF0ZShmdWxsTmFtZSwgZW5kVGFnVG9rZW4uc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgY2xvc2luZyB0YWcgXCIke2VuZFRhZ1Rva2VuLnBhcnRzWzFdfVwiYCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BvcEVsZW1lbnQoZnVsbE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGZvciAobGV0IHN0YWNrSW5kZXggPSB0aGlzLmVsZW1lbnRTdGFjay5sZW5ndGggLSAxOyBzdGFja0luZGV4ID49IDA7IHN0YWNrSW5kZXgtLSkge1xuICAgICAgbGV0IGVsID0gdGhpcy5lbGVtZW50U3RhY2tbc3RhY2tJbmRleF07XG4gICAgICBpZiAoZWwubmFtZSA9PSBmdWxsTmFtZSkge1xuICAgICAgICBMaXN0V3JhcHBlci5zcGxpY2UodGhpcy5lbGVtZW50U3RhY2ssIHN0YWNrSW5kZXgsIHRoaXMuZWxlbWVudFN0YWNrLmxlbmd0aCAtIHN0YWNrSW5kZXgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFnZXRIdG1sVGFnRGVmaW5pdGlvbihlbC5uYW1lKS5jbG9zZWRCeVBhcmVudCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVBdHRyKGF0dHJOYW1lOiBIdG1sVG9rZW4pOiBIdG1sQXR0ckFzdCB7XG4gICAgdmFyIGZ1bGxOYW1lID0gbWVyZ2VOc0FuZE5hbWUoYXR0ck5hbWUucGFydHNbMF0sIGF0dHJOYW1lLnBhcnRzWzFdKTtcbiAgICB2YXIgZW5kID0gYXR0ck5hbWUuc291cmNlU3Bhbi5lbmQ7XG4gICAgdmFyIHZhbHVlID0gJyc7XG4gICAgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLkFUVFJfVkFMVUUpIHtcbiAgICAgIHZhciB2YWx1ZVRva2VuID0gdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgdmFsdWUgPSB2YWx1ZVRva2VuLnBhcnRzWzBdO1xuICAgICAgZW5kID0gdmFsdWVUb2tlbi5zb3VyY2VTcGFuLmVuZDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBIdG1sQXR0ckFzdChmdWxsTmFtZSwgdmFsdWUsIG5ldyBQYXJzZVNvdXJjZVNwYW4oYXR0ck5hbWUuc291cmNlU3Bhbi5zdGFydCwgZW5kKSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRQYXJlbnRFbGVtZW50KCk6IEh0bWxFbGVtZW50QXN0IHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2subGVuZ3RoID4gMCA/IExpc3RXcmFwcGVyLmxhc3QodGhpcy5lbGVtZW50U3RhY2spIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZFRvUGFyZW50KG5vZGU6IEh0bWxBc3QpIHtcbiAgICB2YXIgcGFyZW50ID0gdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpO1xuICAgIGlmIChpc1ByZXNlbnQocGFyZW50KSkge1xuICAgICAgcGFyZW50LmNoaWxkcmVuLnB1c2gobm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm9vdE5vZGVzLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldEVsZW1lbnRGdWxsTmFtZShwcmVmaXg6IHN0cmluZywgbG9jYWxOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudDogSHRtbEVsZW1lbnRBc3QpOiBzdHJpbmcge1xuICBpZiAoaXNCbGFuayhwcmVmaXgpKSB7XG4gICAgcHJlZml4ID0gZ2V0SHRtbFRhZ0RlZmluaXRpb24obG9jYWxOYW1lKS5pbXBsaWNpdE5hbWVzcGFjZVByZWZpeDtcbiAgICBpZiAoaXNCbGFuayhwcmVmaXgpICYmIGlzUHJlc2VudChwYXJlbnRFbGVtZW50KSkge1xuICAgICAgcHJlZml4ID0gZ2V0TnNQcmVmaXgocGFyZW50RWxlbWVudC5uYW1lKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWVyZ2VOc0FuZE5hbWUocHJlZml4LCBsb2NhbE5hbWUpO1xufVxuIl19