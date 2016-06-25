/* */ 
"format cjs";
'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var ast_1 = require('./parser/ast');
var change_detection_util_1 = require('./change_detection_util');
var dynamic_change_detector_1 = require('./dynamic_change_detector');
var directive_record_1 = require('./directive_record');
var event_binding_1 = require('./event_binding');
var coalesce_1 = require('./coalesce');
var proto_record_1 = require('./proto_record');
var DynamicProtoChangeDetector = (function () {
    function DynamicProtoChangeDetector(_definition) {
        this._definition = _definition;
        this._propertyBindingRecords = createPropertyRecords(_definition);
        this._eventBindingRecords = createEventRecords(_definition);
        this._propertyBindingTargets = this._definition.bindingRecords.map(function (b) { return b.target; });
        this._directiveIndices = this._definition.directiveRecords.map(function (d) { return d.directiveIndex; });
    }
    DynamicProtoChangeDetector.prototype.instantiate = function () {
        return new dynamic_change_detector_1.DynamicChangeDetector(this._definition.id, this._propertyBindingRecords.length, this._propertyBindingTargets, this._directiveIndices, this._definition.strategy, this._propertyBindingRecords, this._eventBindingRecords, this._definition.directiveRecords, this._definition.genConfig);
    };
    return DynamicProtoChangeDetector;
})();
exports.DynamicProtoChangeDetector = DynamicProtoChangeDetector;
function createPropertyRecords(definition) {
    var recordBuilder = new ProtoRecordBuilder();
    collection_1.ListWrapper.forEachWithIndex(definition.bindingRecords, function (b, index) { return recordBuilder.add(b, definition.variableNames, index); });
    return coalesce_1.coalesce(recordBuilder.records);
}
exports.createPropertyRecords = createPropertyRecords;
function createEventRecords(definition) {
    // TODO: vsavkin: remove $event when the compiler handles render-side variables properly
    var varNames = collection_1.ListWrapper.concat(['$event'], definition.variableNames);
    return definition.eventRecords.map(function (er) {
        var records = _ConvertAstIntoProtoRecords.create(er, varNames);
        var dirIndex = er.implicitReceiver instanceof directive_record_1.DirectiveIndex ? er.implicitReceiver : null;
        return new event_binding_1.EventBinding(er.target.name, er.target.elementIndex, dirIndex, records);
    });
}
exports.createEventRecords = createEventRecords;
var ProtoRecordBuilder = (function () {
    function ProtoRecordBuilder() {
        this.records = [];
    }
    ProtoRecordBuilder.prototype.add = function (b, variableNames, bindingIndex) {
        var oldLast = collection_1.ListWrapper.last(this.records);
        if (lang_1.isPresent(oldLast) && oldLast.bindingRecord.directiveRecord == b.directiveRecord) {
            oldLast.lastInDirective = false;
        }
        var numberOfRecordsBefore = this.records.length;
        this._appendRecords(b, variableNames, bindingIndex);
        var newLast = collection_1.ListWrapper.last(this.records);
        if (lang_1.isPresent(newLast) && newLast !== oldLast) {
            newLast.lastInBinding = true;
            newLast.lastInDirective = true;
            this._setArgumentToPureFunction(numberOfRecordsBefore);
        }
    };
    /** @internal */
    ProtoRecordBuilder.prototype._setArgumentToPureFunction = function (startIndex) {
        var _this = this;
        for (var i = startIndex; i < this.records.length; ++i) {
            var rec = this.records[i];
            if (rec.isPureFunction()) {
                rec.args.forEach(function (recordIndex) { return _this.records[recordIndex - 1].argumentToPureFunction =
                    true; });
            }
            if (rec.mode === proto_record_1.RecordType.Pipe) {
                rec.args.forEach(function (recordIndex) { return _this.records[recordIndex - 1].argumentToPureFunction =
                    true; });
                this.records[rec.contextIndex - 1].argumentToPureFunction = true;
            }
        }
    };
    /** @internal */
    ProtoRecordBuilder.prototype._appendRecords = function (b, variableNames, bindingIndex) {
        if (b.isDirectiveLifecycle()) {
            this.records.push(new proto_record_1.ProtoRecord(proto_record_1.RecordType.DirectiveLifecycle, b.lifecycleEvent, null, [], [], -1, null, this.records.length + 1, b, false, false, false, false, null));
        }
        else {
            _ConvertAstIntoProtoRecords.append(this.records, b, variableNames, bindingIndex);
        }
    };
    return ProtoRecordBuilder;
})();
exports.ProtoRecordBuilder = ProtoRecordBuilder;
var _ConvertAstIntoProtoRecords = (function () {
    function _ConvertAstIntoProtoRecords(_records, _bindingRecord, _variableNames, _bindingIndex) {
        this._records = _records;
        this._bindingRecord = _bindingRecord;
        this._variableNames = _variableNames;
        this._bindingIndex = _bindingIndex;
    }
    _ConvertAstIntoProtoRecords.append = function (records, b, variableNames, bindingIndex) {
        var c = new _ConvertAstIntoProtoRecords(records, b, variableNames, bindingIndex);
        b.ast.visit(c);
    };
    _ConvertAstIntoProtoRecords.create = function (b, variableNames) {
        var rec = [];
        _ConvertAstIntoProtoRecords.append(rec, b, variableNames, null);
        rec[rec.length - 1].lastInBinding = true;
        return rec;
    };
    _ConvertAstIntoProtoRecords.prototype.visitImplicitReceiver = function (ast) { return this._bindingRecord.implicitReceiver; };
    _ConvertAstIntoProtoRecords.prototype.visitInterpolation = function (ast) {
        var args = this._visitAll(ast.expressions);
        return this._addRecord(proto_record_1.RecordType.Interpolate, "interpolate", _interpolationFn(ast.strings), args, ast.strings, 0);
    };
    _ConvertAstIntoProtoRecords.prototype.visitLiteralPrimitive = function (ast) {
        return this._addRecord(proto_record_1.RecordType.Const, "literal", ast.value, [], null, 0);
    };
    _ConvertAstIntoProtoRecords.prototype.visitPropertyRead = function (ast) {
        var receiver = ast.receiver.visit(this);
        if (lang_1.isPresent(this._variableNames) && collection_1.ListWrapper.contains(this._variableNames, ast.name) &&
            ast.receiver instanceof ast_1.ImplicitReceiver) {
            return this._addRecord(proto_record_1.RecordType.Local, ast.name, ast.name, [], null, receiver);
        }
        else {
            return this._addRecord(proto_record_1.RecordType.PropertyRead, ast.name, ast.getter, [], null, receiver);
        }
    };
    _ConvertAstIntoProtoRecords.prototype.visitPropertyWrite = function (ast) {
        if (lang_1.isPresent(this._variableNames) && collection_1.ListWrapper.contains(this._variableNames, ast.name) &&
            ast.receiver instanceof ast_1.ImplicitReceiver) {
            throw new exceptions_1.BaseException("Cannot reassign a variable binding " + ast.name);
        }
        else {
            var receiver = ast.receiver.visit(this);
            var value = ast.value.visit(this);
            return this._addRecord(proto_record_1.RecordType.PropertyWrite, ast.name, ast.setter, [value], null, receiver);
        }
    };
    _ConvertAstIntoProtoRecords.prototype.visitKeyedWrite = function (ast) {
        var obj = ast.obj.visit(this);
        var key = ast.key.visit(this);
        var value = ast.value.visit(this);
        return this._addRecord(proto_record_1.RecordType.KeyedWrite, null, null, [key, value], null, obj);
    };
    _ConvertAstIntoProtoRecords.prototype.visitSafePropertyRead = function (ast) {
        var receiver = ast.receiver.visit(this);
        return this._addRecord(proto_record_1.RecordType.SafeProperty, ast.name, ast.getter, [], null, receiver);
    };
    _ConvertAstIntoProtoRecords.prototype.visitMethodCall = function (ast) {
        var receiver = ast.receiver.visit(this);
        var args = this._visitAll(ast.args);
        if (lang_1.isPresent(this._variableNames) && collection_1.ListWrapper.contains(this._variableNames, ast.name)) {
            var target = this._addRecord(proto_record_1.RecordType.Local, ast.name, ast.name, [], null, receiver);
            return this._addRecord(proto_record_1.RecordType.InvokeClosure, "closure", null, args, null, target);
        }
        else {
            return this._addRecord(proto_record_1.RecordType.InvokeMethod, ast.name, ast.fn, args, null, receiver);
        }
    };
    _ConvertAstIntoProtoRecords.prototype.visitSafeMethodCall = function (ast) {
        var receiver = ast.receiver.visit(this);
        var args = this._visitAll(ast.args);
        return this._addRecord(proto_record_1.RecordType.SafeMethodInvoke, ast.name, ast.fn, args, null, receiver);
    };
    _ConvertAstIntoProtoRecords.prototype.visitFunctionCall = function (ast) {
        var target = ast.target.visit(this);
        var args = this._visitAll(ast.args);
        return this._addRecord(proto_record_1.RecordType.InvokeClosure, "closure", null, args, null, target);
    };
    _ConvertAstIntoProtoRecords.prototype.visitLiteralArray = function (ast) {
        var primitiveName = "arrayFn" + ast.expressions.length;
        return this._addRecord(proto_record_1.RecordType.CollectionLiteral, primitiveName, _arrayFn(ast.expressions.length), this._visitAll(ast.expressions), null, 0);
    };
    _ConvertAstIntoProtoRecords.prototype.visitLiteralMap = function (ast) {
        return this._addRecord(proto_record_1.RecordType.CollectionLiteral, _mapPrimitiveName(ast.keys), change_detection_util_1.ChangeDetectionUtil.mapFn(ast.keys), this._visitAll(ast.values), null, 0);
    };
    _ConvertAstIntoProtoRecords.prototype.visitBinary = function (ast) {
        var left = ast.left.visit(this);
        switch (ast.operation) {
            case '&&':
                var branchEnd = [null];
                this._addRecord(proto_record_1.RecordType.SkipRecordsIfNot, "SkipRecordsIfNot", null, [], branchEnd, left);
                var right = ast.right.visit(this);
                branchEnd[0] = right;
                return this._addRecord(proto_record_1.RecordType.PrimitiveOp, "cond", change_detection_util_1.ChangeDetectionUtil.cond, [left, right, left], null, 0);
            case '||':
                var branchEnd = [null];
                this._addRecord(proto_record_1.RecordType.SkipRecordsIf, "SkipRecordsIf", null, [], branchEnd, left);
                var right = ast.right.visit(this);
                branchEnd[0] = right;
                return this._addRecord(proto_record_1.RecordType.PrimitiveOp, "cond", change_detection_util_1.ChangeDetectionUtil.cond, [left, left, right], null, 0);
            default:
                var right = ast.right.visit(this);
                return this._addRecord(proto_record_1.RecordType.PrimitiveOp, _operationToPrimitiveName(ast.operation), _operationToFunction(ast.operation), [left, right], null, 0);
        }
    };
    _ConvertAstIntoProtoRecords.prototype.visitPrefixNot = function (ast) {
        var exp = ast.expression.visit(this);
        return this._addRecord(proto_record_1.RecordType.PrimitiveOp, "operation_negate", change_detection_util_1.ChangeDetectionUtil.operation_negate, [exp], null, 0);
    };
    _ConvertAstIntoProtoRecords.prototype.visitConditional = function (ast) {
        var condition = ast.condition.visit(this);
        var startOfFalseBranch = [null];
        var endOfFalseBranch = [null];
        this._addRecord(proto_record_1.RecordType.SkipRecordsIfNot, "SkipRecordsIfNot", null, [], startOfFalseBranch, condition);
        var whenTrue = ast.trueExp.visit(this);
        var skip = this._addRecord(proto_record_1.RecordType.SkipRecords, "SkipRecords", null, [], endOfFalseBranch, 0);
        var whenFalse = ast.falseExp.visit(this);
        startOfFalseBranch[0] = skip;
        endOfFalseBranch[0] = whenFalse;
        return this._addRecord(proto_record_1.RecordType.PrimitiveOp, "cond", change_detection_util_1.ChangeDetectionUtil.cond, [condition, whenTrue, whenFalse], null, 0);
    };
    _ConvertAstIntoProtoRecords.prototype.visitPipe = function (ast) {
        var value = ast.exp.visit(this);
        var args = this._visitAll(ast.args);
        return this._addRecord(proto_record_1.RecordType.Pipe, ast.name, ast.name, args, null, value);
    };
    _ConvertAstIntoProtoRecords.prototype.visitKeyedRead = function (ast) {
        var obj = ast.obj.visit(this);
        var key = ast.key.visit(this);
        return this._addRecord(proto_record_1.RecordType.KeyedRead, "keyedAccess", change_detection_util_1.ChangeDetectionUtil.keyedAccess, [key], null, obj);
    };
    _ConvertAstIntoProtoRecords.prototype.visitChain = function (ast) {
        var _this = this;
        var args = ast.expressions.map(function (e) { return e.visit(_this); });
        return this._addRecord(proto_record_1.RecordType.Chain, "chain", null, args, null, 0);
    };
    _ConvertAstIntoProtoRecords.prototype.visitQuote = function (ast) {
        throw new exceptions_1.BaseException(("Caught uninterpreted expression at " + ast.location + ": " + ast.uninterpretedExpression + ". ") +
            ("Expression prefix " + ast.prefix + " did not match a template transformer to interpret the expression."));
    };
    _ConvertAstIntoProtoRecords.prototype._visitAll = function (asts) {
        var res = collection_1.ListWrapper.createFixedSize(asts.length);
        for (var i = 0; i < asts.length; ++i) {
            res[i] = asts[i].visit(this);
        }
        return res;
    };
    /**
     * Adds a `ProtoRecord` and returns its selfIndex.
     */
    _ConvertAstIntoProtoRecords.prototype._addRecord = function (type, name, funcOrValue, args, fixedArgs, context) {
        var selfIndex = this._records.length + 1;
        if (context instanceof directive_record_1.DirectiveIndex) {
            this._records.push(new proto_record_1.ProtoRecord(type, name, funcOrValue, args, fixedArgs, -1, context, selfIndex, this._bindingRecord, false, false, false, false, this._bindingIndex));
        }
        else {
            this._records.push(new proto_record_1.ProtoRecord(type, name, funcOrValue, args, fixedArgs, context, null, selfIndex, this._bindingRecord, false, false, false, false, this._bindingIndex));
        }
        return selfIndex;
    };
    return _ConvertAstIntoProtoRecords;
})();
function _arrayFn(length) {
    switch (length) {
        case 0:
            return change_detection_util_1.ChangeDetectionUtil.arrayFn0;
        case 1:
            return change_detection_util_1.ChangeDetectionUtil.arrayFn1;
        case 2:
            return change_detection_util_1.ChangeDetectionUtil.arrayFn2;
        case 3:
            return change_detection_util_1.ChangeDetectionUtil.arrayFn3;
        case 4:
            return change_detection_util_1.ChangeDetectionUtil.arrayFn4;
        case 5:
            return change_detection_util_1.ChangeDetectionUtil.arrayFn5;
        case 6:
            return change_detection_util_1.ChangeDetectionUtil.arrayFn6;
        case 7:
            return change_detection_util_1.ChangeDetectionUtil.arrayFn7;
        case 8:
            return change_detection_util_1.ChangeDetectionUtil.arrayFn8;
        case 9:
            return change_detection_util_1.ChangeDetectionUtil.arrayFn9;
        default:
            throw new exceptions_1.BaseException("Does not support literal maps with more than 9 elements");
    }
}
function _mapPrimitiveName(keys) {
    var stringifiedKeys = keys.map(function (k) { return lang_1.isString(k) ? "\"" + k + "\"" : "" + k; }).join(', ');
    return "mapFn([" + stringifiedKeys + "])";
}
function _operationToPrimitiveName(operation) {
    switch (operation) {
        case '+':
            return "operation_add";
        case '-':
            return "operation_subtract";
        case '*':
            return "operation_multiply";
        case '/':
            return "operation_divide";
        case '%':
            return "operation_remainder";
        case '==':
            return "operation_equals";
        case '!=':
            return "operation_not_equals";
        case '===':
            return "operation_identical";
        case '!==':
            return "operation_not_identical";
        case '<':
            return "operation_less_then";
        case '>':
            return "operation_greater_then";
        case '<=':
            return "operation_less_or_equals_then";
        case '>=':
            return "operation_greater_or_equals_then";
        default:
            throw new exceptions_1.BaseException("Unsupported operation " + operation);
    }
}
function _operationToFunction(operation) {
    switch (operation) {
        case '+':
            return change_detection_util_1.ChangeDetectionUtil.operation_add;
        case '-':
            return change_detection_util_1.ChangeDetectionUtil.operation_subtract;
        case '*':
            return change_detection_util_1.ChangeDetectionUtil.operation_multiply;
        case '/':
            return change_detection_util_1.ChangeDetectionUtil.operation_divide;
        case '%':
            return change_detection_util_1.ChangeDetectionUtil.operation_remainder;
        case '==':
            return change_detection_util_1.ChangeDetectionUtil.operation_equals;
        case '!=':
            return change_detection_util_1.ChangeDetectionUtil.operation_not_equals;
        case '===':
            return change_detection_util_1.ChangeDetectionUtil.operation_identical;
        case '!==':
            return change_detection_util_1.ChangeDetectionUtil.operation_not_identical;
        case '<':
            return change_detection_util_1.ChangeDetectionUtil.operation_less_then;
        case '>':
            return change_detection_util_1.ChangeDetectionUtil.operation_greater_then;
        case '<=':
            return change_detection_util_1.ChangeDetectionUtil.operation_less_or_equals_then;
        case '>=':
            return change_detection_util_1.ChangeDetectionUtil.operation_greater_or_equals_then;
        default:
            throw new exceptions_1.BaseException("Unsupported operation " + operation);
    }
}
function s(v) {
    return lang_1.isPresent(v) ? "" + v : '';
}
function _interpolationFn(strings) {
    var length = strings.length;
    var c0 = length > 0 ? strings[0] : null;
    var c1 = length > 1 ? strings[1] : null;
    var c2 = length > 2 ? strings[2] : null;
    var c3 = length > 3 ? strings[3] : null;
    var c4 = length > 4 ? strings[4] : null;
    var c5 = length > 5 ? strings[5] : null;
    var c6 = length > 6 ? strings[6] : null;
    var c7 = length > 7 ? strings[7] : null;
    var c8 = length > 8 ? strings[8] : null;
    var c9 = length > 9 ? strings[9] : null;
    switch (length - 1) {
        case 1:
            return function (a1) { return c0 + s(a1) + c1; };
        case 2:
            return function (a1, a2) { return c0 + s(a1) + c1 + s(a2) + c2; };
        case 3:
            return function (a1, a2, a3) { return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3; };
        case 4:
            return function (a1, a2, a3, a4) { return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4; };
        case 5:
            return function (a1, a2, a3, a4, a5) {
                return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5;
            };
        case 6:
            return function (a1, a2, a3, a4, a5, a6) {
                return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6;
            };
        case 7:
            return function (a1, a2, a3, a4, a5, a6, a7) { return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) +
                c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7; };
        case 8:
            return function (a1, a2, a3, a4, a5, a6, a7, a8) { return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) +
                c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7 + s(a8) +
                c8; };
        case 9:
            return function (a1, a2, a3, a4, a5, a6, a7, a8, a9) { return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 +
                s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) +
                c7 + s(a8) + c8 + s(a9) + c9; };
        default:
            throw new exceptions_1.BaseException("Does not support more than 9 expressions");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9fY2hhbmdlX2RldGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wcm90b19jaGFuZ2VfZGV0ZWN0b3IudHMiXSwibmFtZXMiOlsiRHluYW1pY1Byb3RvQ2hhbmdlRGV0ZWN0b3IiLCJEeW5hbWljUHJvdG9DaGFuZ2VEZXRlY3Rvci5jb25zdHJ1Y3RvciIsIkR5bmFtaWNQcm90b0NoYW5nZURldGVjdG9yLmluc3RhbnRpYXRlIiwiY3JlYXRlUHJvcGVydHlSZWNvcmRzIiwiY3JlYXRlRXZlbnRSZWNvcmRzIiwiUHJvdG9SZWNvcmRCdWlsZGVyIiwiUHJvdG9SZWNvcmRCdWlsZGVyLmNvbnN0cnVjdG9yIiwiUHJvdG9SZWNvcmRCdWlsZGVyLmFkZCIsIlByb3RvUmVjb3JkQnVpbGRlci5fc2V0QXJndW1lbnRUb1B1cmVGdW5jdGlvbiIsIlByb3RvUmVjb3JkQnVpbGRlci5fYXBwZW5kUmVjb3JkcyIsIl9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3JkcyIsIl9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3Jkcy5jb25zdHJ1Y3RvciIsIl9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3Jkcy5hcHBlbmQiLCJfQ29udmVydEFzdEludG9Qcm90b1JlY29yZHMuY3JlYXRlIiwiX0NvbnZlcnRBc3RJbnRvUHJvdG9SZWNvcmRzLnZpc2l0SW1wbGljaXRSZWNlaXZlciIsIl9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3Jkcy52aXNpdEludGVycG9sYXRpb24iLCJfQ29udmVydEFzdEludG9Qcm90b1JlY29yZHMudmlzaXRMaXRlcmFsUHJpbWl0aXZlIiwiX0NvbnZlcnRBc3RJbnRvUHJvdG9SZWNvcmRzLnZpc2l0UHJvcGVydHlSZWFkIiwiX0NvbnZlcnRBc3RJbnRvUHJvdG9SZWNvcmRzLnZpc2l0UHJvcGVydHlXcml0ZSIsIl9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3Jkcy52aXNpdEtleWVkV3JpdGUiLCJfQ29udmVydEFzdEludG9Qcm90b1JlY29yZHMudmlzaXRTYWZlUHJvcGVydHlSZWFkIiwiX0NvbnZlcnRBc3RJbnRvUHJvdG9SZWNvcmRzLnZpc2l0TWV0aG9kQ2FsbCIsIl9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3Jkcy52aXNpdFNhZmVNZXRob2RDYWxsIiwiX0NvbnZlcnRBc3RJbnRvUHJvdG9SZWNvcmRzLnZpc2l0RnVuY3Rpb25DYWxsIiwiX0NvbnZlcnRBc3RJbnRvUHJvdG9SZWNvcmRzLnZpc2l0TGl0ZXJhbEFycmF5IiwiX0NvbnZlcnRBc3RJbnRvUHJvdG9SZWNvcmRzLnZpc2l0TGl0ZXJhbE1hcCIsIl9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3Jkcy52aXNpdEJpbmFyeSIsIl9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3Jkcy52aXNpdFByZWZpeE5vdCIsIl9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3Jkcy52aXNpdENvbmRpdGlvbmFsIiwiX0NvbnZlcnRBc3RJbnRvUHJvdG9SZWNvcmRzLnZpc2l0UGlwZSIsIl9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3Jkcy52aXNpdEtleWVkUmVhZCIsIl9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3Jkcy52aXNpdENoYWluIiwiX0NvbnZlcnRBc3RJbnRvUHJvdG9SZWNvcmRzLnZpc2l0UXVvdGUiLCJfQ29udmVydEFzdEludG9Qcm90b1JlY29yZHMuX3Zpc2l0QWxsIiwiX0NvbnZlcnRBc3RJbnRvUHJvdG9SZWNvcmRzLl9hZGRSZWNvcmQiLCJfYXJyYXlGbiIsIl9tYXBQcmltaXRpdmVOYW1lIiwiX29wZXJhdGlvblRvUHJpbWl0aXZlTmFtZSIsIl9vcGVyYXRpb25Ub0Z1bmN0aW9uIiwicyIsIl9pbnRlcnBvbGF0aW9uRm4iXSwibWFwcGluZ3MiOiJBQUFBLHFCQUFpRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQzVFLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELDJCQUF3RCxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRXpGLG9CQXVCTyxj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Y0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsRUFDMURBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1FBQzFEQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQTtJQUNuQkEsQ0FBQ0E7SUFDSHhCLGtDQUFDQTtBQUFEQSxDQUFDQSxBQXBNRCxJQW9NQztBQUdELGtCQUFrQixNQUFjO0lBQzlCeUIsTUFBTUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDZkEsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsMkNBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUN0Q0EsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsMkNBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUN0Q0EsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsMkNBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUN0Q0EsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsMkNBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUN0Q0EsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsMkNBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUN0Q0EsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsMkNBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUN0Q0EsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsMkNBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUN0Q0EsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsMkNBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUN0Q0EsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsMkNBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUN0Q0EsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsMkNBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUN0Q0E7WUFDRUEsTUFB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LEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ3hDQSxJQUFJQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUN4Q0EsSUFBSUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDeENBLElBQUlBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ3hDQSxJQUFJQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUN4Q0EsSUFBSUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDeENBLE1BQU1BLENBQUNBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ25CQSxLQUFLQSxDQUFDQTtZQUNKQSxNQUFNQSxDQUFDQSxVQUFDQSxFQUFFQSxJQUFLQSxPQUFBQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUFmQSxDQUFlQSxDQUFDQTtRQUNqQ0EsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsVUFBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsSUFBS0EsT0FBQUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFBNUJBLENBQTRCQSxDQUFDQTtRQUNsREEsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsVUFBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsSUFBS0EsT0FBQUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFBekNBLENBQXlDQSxDQUFDQTtRQUNuRUEsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsVUFBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsSUFBS0EsT0FBQUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFBdERBLENBQXNEQSxDQUFDQTtRQUNwRkEsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsVUFBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUE7dUJBQ2ZBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBO1lBQW5FQSxDQUFtRUEsQ0FBQ0E7UUFDakZBLEtBQUtBLENBQUNBO1lBQ0pBLE1BQU1BLENBQUNBLFVBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBO3VCQUNuQkEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUE7WUFBaEZBLENBQWdGQSxDQUFDQTtRQUM5RkEsS0FBS0EsQ0FBQ0E7WUFDSkEsTUFBTUEsQ0FBQ0EsVUFBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsSUFBS0EsT0FBQUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7Z0JBQ2pEQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUR6Q0EsQ0FDeUNBLENBQUNBO1FBQ25GQSxLQUFLQSxDQUFDQTtZQUNKQSxNQUFNQSxDQUFDQSxVQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxJQUFLQSxPQUFBQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQTtnQkFDakRBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBO2dCQUNqREEsRUFBRUEsRUFGRkEsQ0FFRUEsQ0FBQ0E7UUFDaERBLEtBQUtBLENBQUNBO1lBQ0pBLE1BQU1BLENBQUNBLFVBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLElBQUtBLE9BQUFBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBO2dCQUN6Q0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7Z0JBQzVDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUY1QkEsQ0FFNEJBLENBQUNBO1FBQzlFQTtZQUNFQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0EsMENBQTBDQSxDQUFDQSxDQUFDQTtJQUN4RUEsQ0FBQ0E7QUFDSEEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIGlzQmxhbmssIGlzUHJlc2VudCwgaXNTdHJpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge1xuICBQcm9wZXJ0eVJlYWQsXG4gIFByb3BlcnR5V3JpdGUsXG4gIEtleWVkV3JpdGUsXG4gIEFTVCxcbiAgQVNUV2l0aFNvdXJjZSxcbiAgQXN0VmlzaXRvcixcbiAgQmluYXJ5LFxuICBDaGFpbixcbiAgQ29uZGl0aW9uYWwsXG4gIEJpbmRpbmdQaXBlLFxuICBGdW5jdGlvbkNhbGwsXG4gIEltcGxpY2l0UmVjZWl2ZXIsXG4gIEludGVycG9sYXRpb24sXG4gIEtleWVkUmVhZCxcbiAgTGl0ZXJhbEFycmF5LFxuICBMaXRlcmFsTWFwLFxuICBMaXRlcmFsUHJpbWl0aXZlLFxuICBNZXRob2RDYWxsLFxuICBQcmVmaXhOb3QsXG4gIFF1b3RlLFxuICBTYWZlUHJvcGVydHlSZWFkLFxuICBTYWZlTWV0aG9kQ2FsbFxufSBmcm9tICcuL3BhcnNlci9hc3QnO1xuXG5pbXBvcnQge0NoYW5nZURldGVjdG9yLCBQcm90b0NoYW5nZURldGVjdG9yLCBDaGFuZ2VEZXRlY3RvckRlZmluaXRpb259IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblV0aWx9IGZyb20gJy4vY2hhbmdlX2RldGVjdGlvbl91dGlsJztcbmltcG9ydCB7RHluYW1pY0NoYW5nZURldGVjdG9yfSBmcm9tICcuL2R5bmFtaWNfY2hhbmdlX2RldGVjdG9yJztcbmltcG9ydCB7QmluZGluZ1JlY29yZCwgQmluZGluZ1RhcmdldH0gZnJvbSAnLi9iaW5kaW5nX3JlY29yZCc7XG5pbXBvcnQge0RpcmVjdGl2ZVJlY29yZCwgRGlyZWN0aXZlSW5kZXh9IGZyb20gJy4vZGlyZWN0aXZlX3JlY29yZCc7XG5pbXBvcnQge0V2ZW50QmluZGluZ30gZnJvbSAnLi9ldmVudF9iaW5kaW5nJztcblxuaW1wb3J0IHtjb2FsZXNjZX0gZnJvbSAnLi9jb2FsZXNjZSc7XG5pbXBvcnQge1Byb3RvUmVjb3JkLCBSZWNvcmRUeXBlfSBmcm9tICcuL3Byb3RvX3JlY29yZCc7XG5cbmV4cG9ydCBjbGFzcyBEeW5hbWljUHJvdG9DaGFuZ2VEZXRlY3RvciBpbXBsZW1lbnRzIFByb3RvQ2hhbmdlRGV0ZWN0b3Ige1xuICAvKiogQGludGVybmFsICovXG4gIF9wcm9wZXJ0eUJpbmRpbmdSZWNvcmRzOiBQcm90b1JlY29yZFtdO1xuICAvKiogQGludGVybmFsICovXG4gIF9wcm9wZXJ0eUJpbmRpbmdUYXJnZXRzOiBCaW5kaW5nVGFyZ2V0W107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2V2ZW50QmluZGluZ1JlY29yZHM6IEV2ZW50QmluZGluZ1tdO1xuICAvKiogQGludGVybmFsICovXG4gIF9kaXJlY3RpdmVJbmRpY2VzOiBEaXJlY3RpdmVJbmRleFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2RlZmluaXRpb246IENoYW5nZURldGVjdG9yRGVmaW5pdGlvbikge1xuICAgIHRoaXMuX3Byb3BlcnR5QmluZGluZ1JlY29yZHMgPSBjcmVhdGVQcm9wZXJ0eVJlY29yZHMoX2RlZmluaXRpb24pO1xuICAgIHRoaXMuX2V2ZW50QmluZGluZ1JlY29yZHMgPSBjcmVhdGVFdmVudFJlY29yZHMoX2RlZmluaXRpb24pO1xuICAgIHRoaXMuX3Byb3BlcnR5QmluZGluZ1RhcmdldHMgPSB0aGlzLl9kZWZpbml0aW9uLmJpbmRpbmdSZWNvcmRzLm1hcChiID0+IGIudGFyZ2V0KTtcbiAgICB0aGlzLl9kaXJlY3RpdmVJbmRpY2VzID0gdGhpcy5fZGVmaW5pdGlvbi5kaXJlY3RpdmVSZWNvcmRzLm1hcChkID0+IGQuZGlyZWN0aXZlSW5kZXgpO1xuICB9XG5cbiAgaW5zdGFudGlhdGUoKTogQ2hhbmdlRGV0ZWN0b3Ige1xuICAgIHJldHVybiBuZXcgRHluYW1pY0NoYW5nZURldGVjdG9yKFxuICAgICAgICB0aGlzLl9kZWZpbml0aW9uLmlkLCB0aGlzLl9wcm9wZXJ0eUJpbmRpbmdSZWNvcmRzLmxlbmd0aCwgdGhpcy5fcHJvcGVydHlCaW5kaW5nVGFyZ2V0cyxcbiAgICAgICAgdGhpcy5fZGlyZWN0aXZlSW5kaWNlcywgdGhpcy5fZGVmaW5pdGlvbi5zdHJhdGVneSwgdGhpcy5fcHJvcGVydHlCaW5kaW5nUmVjb3JkcyxcbiAgICAgICAgdGhpcy5fZXZlbnRCaW5kaW5nUmVjb3JkcywgdGhpcy5fZGVmaW5pdGlvbi5kaXJlY3RpdmVSZWNvcmRzLCB0aGlzLl9kZWZpbml0aW9uLmdlbkNvbmZpZyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb3BlcnR5UmVjb3JkcyhkZWZpbml0aW9uOiBDaGFuZ2VEZXRlY3RvckRlZmluaXRpb24pOiBQcm90b1JlY29yZFtdIHtcbiAgdmFyIHJlY29yZEJ1aWxkZXIgPSBuZXcgUHJvdG9SZWNvcmRCdWlsZGVyKCk7XG4gIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgoZGVmaW5pdGlvbi5iaW5kaW5nUmVjb3JkcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoYiwgaW5kZXgpID0+IHJlY29yZEJ1aWxkZXIuYWRkKGIsIGRlZmluaXRpb24udmFyaWFibGVOYW1lcywgaW5kZXgpKTtcbiAgcmV0dXJuIGNvYWxlc2NlKHJlY29yZEJ1aWxkZXIucmVjb3Jkcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFdmVudFJlY29yZHMoZGVmaW5pdGlvbjogQ2hhbmdlRGV0ZWN0b3JEZWZpbml0aW9uKTogRXZlbnRCaW5kaW5nW10ge1xuICAvLyBUT0RPOiB2c2F2a2luOiByZW1vdmUgJGV2ZW50IHdoZW4gdGhlIGNvbXBpbGVyIGhhbmRsZXMgcmVuZGVyLXNpZGUgdmFyaWFibGVzIHByb3Blcmx5XG4gIHZhciB2YXJOYW1lcyA9IExpc3RXcmFwcGVyLmNvbmNhdChbJyRldmVudCddLCBkZWZpbml0aW9uLnZhcmlhYmxlTmFtZXMpO1xuICByZXR1cm4gZGVmaW5pdGlvbi5ldmVudFJlY29yZHMubWFwKGVyID0+IHtcbiAgICB2YXIgcmVjb3JkcyA9IF9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3Jkcy5jcmVhdGUoZXIsIHZhck5hbWVzKTtcbiAgICB2YXIgZGlySW5kZXggPSBlci5pbXBsaWNpdFJlY2VpdmVyIGluc3RhbmNlb2YgRGlyZWN0aXZlSW5kZXggPyBlci5pbXBsaWNpdFJlY2VpdmVyIDogbnVsbDtcbiAgICByZXR1cm4gbmV3IEV2ZW50QmluZGluZyhlci50YXJnZXQubmFtZSwgZXIudGFyZ2V0LmVsZW1lbnRJbmRleCwgZGlySW5kZXgsIHJlY29yZHMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGNsYXNzIFByb3RvUmVjb3JkQnVpbGRlciB7XG4gIHJlY29yZHM6IFByb3RvUmVjb3JkW10gPSBbXTtcblxuICBhZGQoYjogQmluZGluZ1JlY29yZCwgdmFyaWFibGVOYW1lczogc3RyaW5nW10sIGJpbmRpbmdJbmRleDogbnVtYmVyKSB7XG4gICAgdmFyIG9sZExhc3QgPSBMaXN0V3JhcHBlci5sYXN0KHRoaXMucmVjb3Jkcyk7XG4gICAgaWYgKGlzUHJlc2VudChvbGRMYXN0KSAmJiBvbGRMYXN0LmJpbmRpbmdSZWNvcmQuZGlyZWN0aXZlUmVjb3JkID09IGIuZGlyZWN0aXZlUmVjb3JkKSB7XG4gICAgICBvbGRMYXN0Lmxhc3RJbkRpcmVjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgbnVtYmVyT2ZSZWNvcmRzQmVmb3JlID0gdGhpcy5yZWNvcmRzLmxlbmd0aDtcbiAgICB0aGlzLl9hcHBlbmRSZWNvcmRzKGIsIHZhcmlhYmxlTmFtZXMsIGJpbmRpbmdJbmRleCk7XG4gICAgdmFyIG5ld0xhc3QgPSBMaXN0V3JhcHBlci5sYXN0KHRoaXMucmVjb3Jkcyk7XG4gICAgaWYgKGlzUHJlc2VudChuZXdMYXN0KSAmJiBuZXdMYXN0ICE9PSBvbGRMYXN0KSB7XG4gICAgICBuZXdMYXN0Lmxhc3RJbkJpbmRpbmcgPSB0cnVlO1xuICAgICAgbmV3TGFzdC5sYXN0SW5EaXJlY3RpdmUgPSB0cnVlO1xuICAgICAgdGhpcy5fc2V0QXJndW1lbnRUb1B1cmVGdW5jdGlvbihudW1iZXJPZlJlY29yZHNCZWZvcmUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3NldEFyZ3VtZW50VG9QdXJlRnVuY3Rpb24oc3RhcnRJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXg7IGkgPCB0aGlzLnJlY29yZHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciByZWMgPSB0aGlzLnJlY29yZHNbaV07XG4gICAgICBpZiAocmVjLmlzUHVyZUZ1bmN0aW9uKCkpIHtcbiAgICAgICAgcmVjLmFyZ3MuZm9yRWFjaChyZWNvcmRJbmRleCA9PiB0aGlzLnJlY29yZHNbcmVjb3JkSW5kZXggLSAxXS5hcmd1bWVudFRvUHVyZUZ1bmN0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAocmVjLm1vZGUgPT09IFJlY29yZFR5cGUuUGlwZSkge1xuICAgICAgICByZWMuYXJncy5mb3JFYWNoKHJlY29yZEluZGV4ID0+IHRoaXMucmVjb3Jkc1tyZWNvcmRJbmRleCAtIDFdLmFyZ3VtZW50VG9QdXJlRnVuY3Rpb24gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnVlKTtcbiAgICAgICAgdGhpcy5yZWNvcmRzW3JlYy5jb250ZXh0SW5kZXggLSAxXS5hcmd1bWVudFRvUHVyZUZ1bmN0aW9uID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hcHBlbmRSZWNvcmRzKGI6IEJpbmRpbmdSZWNvcmQsIHZhcmlhYmxlTmFtZXM6IHN0cmluZ1tdLCBiaW5kaW5nSW5kZXg6IG51bWJlcikge1xuICAgIGlmIChiLmlzRGlyZWN0aXZlTGlmZWN5Y2xlKCkpIHtcbiAgICAgIHRoaXMucmVjb3Jkcy5wdXNoKG5ldyBQcm90b1JlY29yZChSZWNvcmRUeXBlLkRpcmVjdGl2ZUxpZmVjeWNsZSwgYi5saWZlY3ljbGVFdmVudCwgbnVsbCwgW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW10sIC0xLCBudWxsLCB0aGlzLnJlY29yZHMubGVuZ3RoICsgMSwgYiwgZmFsc2UsIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLCBmYWxzZSwgbnVsbCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBfQ29udmVydEFzdEludG9Qcm90b1JlY29yZHMuYXBwZW5kKHRoaXMucmVjb3JkcywgYiwgdmFyaWFibGVOYW1lcywgYmluZGluZ0luZGV4KTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgX0NvbnZlcnRBc3RJbnRvUHJvdG9SZWNvcmRzIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3JlY29yZHM6IFByb3RvUmVjb3JkW10sIHByaXZhdGUgX2JpbmRpbmdSZWNvcmQ6IEJpbmRpbmdSZWNvcmQsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3ZhcmlhYmxlTmFtZXM6IHN0cmluZ1tdLCBwcml2YXRlIF9iaW5kaW5nSW5kZXg6IG51bWJlcikge31cblxuICBzdGF0aWMgYXBwZW5kKHJlY29yZHM6IFByb3RvUmVjb3JkW10sIGI6IEJpbmRpbmdSZWNvcmQsIHZhcmlhYmxlTmFtZXM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICAgIGJpbmRpbmdJbmRleDogbnVtYmVyKSB7XG4gICAgdmFyIGMgPSBuZXcgX0NvbnZlcnRBc3RJbnRvUHJvdG9SZWNvcmRzKHJlY29yZHMsIGIsIHZhcmlhYmxlTmFtZXMsIGJpbmRpbmdJbmRleCk7XG4gICAgYi5hc3QudmlzaXQoYyk7XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlKGI6IEJpbmRpbmdSZWNvcmQsIHZhcmlhYmxlTmFtZXM6IGFueVtdKTogUHJvdG9SZWNvcmRbXSB7XG4gICAgdmFyIHJlYyA9IFtdO1xuICAgIF9Db252ZXJ0QXN0SW50b1Byb3RvUmVjb3Jkcy5hcHBlbmQocmVjLCBiLCB2YXJpYWJsZU5hbWVzLCBudWxsKTtcbiAgICByZWNbcmVjLmxlbmd0aCAtIDFdLmxhc3RJbkJpbmRpbmcgPSB0cnVlO1xuICAgIHJldHVybiByZWM7XG4gIH1cblxuICB2aXNpdEltcGxpY2l0UmVjZWl2ZXIoYXN0OiBJbXBsaWNpdFJlY2VpdmVyKTogYW55IHsgcmV0dXJuIHRoaXMuX2JpbmRpbmdSZWNvcmQuaW1wbGljaXRSZWNlaXZlcjsgfVxuXG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24pOiBudW1iZXIge1xuICAgIHZhciBhcmdzID0gdGhpcy5fdmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKTtcbiAgICByZXR1cm4gdGhpcy5fYWRkUmVjb3JkKFJlY29yZFR5cGUuSW50ZXJwb2xhdGUsIFwiaW50ZXJwb2xhdGVcIiwgX2ludGVycG9sYXRpb25Gbihhc3Quc3RyaW5ncyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzLCBhc3Quc3RyaW5ncywgMCk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fYWRkUmVjb3JkKFJlY29yZFR5cGUuQ29uc3QsIFwibGl0ZXJhbFwiLCBhc3QudmFsdWUsIFtdLCBudWxsLCAwKTtcbiAgfVxuXG4gIHZpc2l0UHJvcGVydHlSZWFkKGFzdDogUHJvcGVydHlSZWFkKTogbnVtYmVyIHtcbiAgICB2YXIgcmVjZWl2ZXIgPSBhc3QucmVjZWl2ZXIudmlzaXQodGhpcyk7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl92YXJpYWJsZU5hbWVzKSAmJiBMaXN0V3JhcHBlci5jb250YWlucyh0aGlzLl92YXJpYWJsZU5hbWVzLCBhc3QubmFtZSkgJiZcbiAgICAgICAgYXN0LnJlY2VpdmVyIGluc3RhbmNlb2YgSW1wbGljaXRSZWNlaXZlcikge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZFJlY29yZChSZWNvcmRUeXBlLkxvY2FsLCBhc3QubmFtZSwgYXN0Lm5hbWUsIFtdLCBudWxsLCByZWNlaXZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9hZGRSZWNvcmQoUmVjb3JkVHlwZS5Qcm9wZXJ0eVJlYWQsIGFzdC5uYW1lLCBhc3QuZ2V0dGVyLCBbXSwgbnVsbCwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0UHJvcGVydHlXcml0ZShhc3Q6IFByb3BlcnR5V3JpdGUpOiBudW1iZXIge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fdmFyaWFibGVOYW1lcykgJiYgTGlzdFdyYXBwZXIuY29udGFpbnModGhpcy5fdmFyaWFibGVOYW1lcywgYXN0Lm5hbWUpICYmXG4gICAgICAgIGFzdC5yZWNlaXZlciBpbnN0YW5jZW9mIEltcGxpY2l0UmVjZWl2ZXIpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgcmVhc3NpZ24gYSB2YXJpYWJsZSBiaW5kaW5nICR7YXN0Lm5hbWV9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZWNlaXZlciA9IGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICAgIHZhciB2YWx1ZSA9IGFzdC52YWx1ZS52aXNpdCh0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZGRSZWNvcmQoUmVjb3JkVHlwZS5Qcm9wZXJ0eVdyaXRlLCBhc3QubmFtZSwgYXN0LnNldHRlciwgW3ZhbHVlXSwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IEtleWVkV3JpdGUpOiBudW1iZXIge1xuICAgIHZhciBvYmogPSBhc3Qub2JqLnZpc2l0KHRoaXMpO1xuICAgIHZhciBrZXkgPSBhc3Qua2V5LnZpc2l0KHRoaXMpO1xuICAgIHZhciB2YWx1ZSA9IGFzdC52YWx1ZS52aXNpdCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5fYWRkUmVjb3JkKFJlY29yZFR5cGUuS2V5ZWRXcml0ZSwgbnVsbCwgbnVsbCwgW2tleSwgdmFsdWVdLCBudWxsLCBvYmopO1xuICB9XG5cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCk6IG51bWJlciB7XG4gICAgdmFyIHJlY2VpdmVyID0gYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiB0aGlzLl9hZGRSZWNvcmQoUmVjb3JkVHlwZS5TYWZlUHJvcGVydHksIGFzdC5uYW1lLCBhc3QuZ2V0dGVyLCBbXSwgbnVsbCwgcmVjZWl2ZXIpO1xuICB9XG5cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCk6IG51bWJlciB7XG4gICAgdmFyIHJlY2VpdmVyID0gYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIHZhciBhcmdzID0gdGhpcy5fdmlzaXRBbGwoYXN0LmFyZ3MpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fdmFyaWFibGVOYW1lcykgJiYgTGlzdFdyYXBwZXIuY29udGFpbnModGhpcy5fdmFyaWFibGVOYW1lcywgYXN0Lm5hbWUpKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gdGhpcy5fYWRkUmVjb3JkKFJlY29yZFR5cGUuTG9jYWwsIGFzdC5uYW1lLCBhc3QubmFtZSwgW10sIG51bGwsIHJlY2VpdmVyKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZGRSZWNvcmQoUmVjb3JkVHlwZS5JbnZva2VDbG9zdXJlLCBcImNsb3N1cmVcIiwgbnVsbCwgYXJncywgbnVsbCwgdGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZFJlY29yZChSZWNvcmRUeXBlLkludm9rZU1ldGhvZCwgYXN0Lm5hbWUsIGFzdC5mbiwgYXJncywgbnVsbCwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCk6IG51bWJlciB7XG4gICAgdmFyIHJlY2VpdmVyID0gYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIHZhciBhcmdzID0gdGhpcy5fdmlzaXRBbGwoYXN0LmFyZ3MpO1xuICAgIHJldHVybiB0aGlzLl9hZGRSZWNvcmQoUmVjb3JkVHlwZS5TYWZlTWV0aG9kSW52b2tlLCBhc3QubmFtZSwgYXN0LmZuLCBhcmdzLCBudWxsLCByZWNlaXZlcik7XG4gIH1cblxuICB2aXNpdEZ1bmN0aW9uQ2FsbChhc3Q6IEZ1bmN0aW9uQ2FsbCk6IG51bWJlciB7XG4gICAgdmFyIHRhcmdldCA9IGFzdC50YXJnZXQudmlzaXQodGhpcyk7XG4gICAgdmFyIGFyZ3MgPSB0aGlzLl92aXNpdEFsbChhc3QuYXJncyk7XG4gICAgcmV0dXJuIHRoaXMuX2FkZFJlY29yZChSZWNvcmRUeXBlLkludm9rZUNsb3N1cmUsIFwiY2xvc3VyZVwiLCBudWxsLCBhcmdzLCBudWxsLCB0YXJnZXQpO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXN0OiBMaXRlcmFsQXJyYXkpOiBudW1iZXIge1xuICAgIHZhciBwcmltaXRpdmVOYW1lID0gYGFycmF5Rm4ke2FzdC5leHByZXNzaW9ucy5sZW5ndGh9YDtcbiAgICByZXR1cm4gdGhpcy5fYWRkUmVjb3JkKFJlY29yZFR5cGUuQ29sbGVjdGlvbkxpdGVyYWwsIHByaW1pdGl2ZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBfYXJyYXlGbihhc3QuZXhwcmVzc2lvbnMubGVuZ3RoKSwgdGhpcy5fdmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKSwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIDApO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsTWFwKGFzdDogTGl0ZXJhbE1hcCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2FkZFJlY29yZChSZWNvcmRUeXBlLkNvbGxlY3Rpb25MaXRlcmFsLCBfbWFwUHJpbWl0aXZlTmFtZShhc3Qua2V5cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBDaGFuZ2VEZXRlY3Rpb25VdGlsLm1hcEZuKGFzdC5rZXlzKSwgdGhpcy5fdmlzaXRBbGwoYXN0LnZhbHVlcyksIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAwKTtcbiAgfVxuXG4gIHZpc2l0QmluYXJ5KGFzdDogQmluYXJ5KTogbnVtYmVyIHtcbiAgICB2YXIgbGVmdCA9IGFzdC5sZWZ0LnZpc2l0KHRoaXMpO1xuICAgIHN3aXRjaCAoYXN0Lm9wZXJhdGlvbikge1xuICAgICAgY2FzZSAnJiYnOlxuICAgICAgICB2YXIgYnJhbmNoRW5kID0gW251bGxdO1xuICAgICAgICB0aGlzLl9hZGRSZWNvcmQoUmVjb3JkVHlwZS5Ta2lwUmVjb3Jkc0lmTm90LCBcIlNraXBSZWNvcmRzSWZOb3RcIiwgbnVsbCwgW10sIGJyYW5jaEVuZCwgbGVmdCk7XG4gICAgICAgIHZhciByaWdodCA9IGFzdC5yaWdodC52aXNpdCh0aGlzKTtcbiAgICAgICAgYnJhbmNoRW5kWzBdID0gcmlnaHQ7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRSZWNvcmQoUmVjb3JkVHlwZS5QcmltaXRpdmVPcCwgXCJjb25kXCIsIENoYW5nZURldGVjdGlvblV0aWwuY29uZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbGVmdCwgcmlnaHQsIGxlZnRdLCBudWxsLCAwKTtcblxuICAgICAgY2FzZSAnfHwnOlxuICAgICAgICB2YXIgYnJhbmNoRW5kID0gW251bGxdO1xuICAgICAgICB0aGlzLl9hZGRSZWNvcmQoUmVjb3JkVHlwZS5Ta2lwUmVjb3Jkc0lmLCBcIlNraXBSZWNvcmRzSWZcIiwgbnVsbCwgW10sIGJyYW5jaEVuZCwgbGVmdCk7XG4gICAgICAgIHZhciByaWdodCA9IGFzdC5yaWdodC52aXNpdCh0aGlzKTtcbiAgICAgICAgYnJhbmNoRW5kWzBdID0gcmlnaHQ7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRSZWNvcmQoUmVjb3JkVHlwZS5QcmltaXRpdmVPcCwgXCJjb25kXCIsIENoYW5nZURldGVjdGlvblV0aWwuY29uZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbGVmdCwgbGVmdCwgcmlnaHRdLCBudWxsLCAwKTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIHJpZ2h0ID0gYXN0LnJpZ2h0LnZpc2l0KHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkUmVjb3JkKFJlY29yZFR5cGUuUHJpbWl0aXZlT3AsIF9vcGVyYXRpb25Ub1ByaW1pdGl2ZU5hbWUoYXN0Lm9wZXJhdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX29wZXJhdGlvblRvRnVuY3Rpb24oYXN0Lm9wZXJhdGlvbiksIFtsZWZ0LCByaWdodF0sIG51bGwsIDApO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0UHJlZml4Tm90KGFzdDogUHJlZml4Tm90KTogbnVtYmVyIHtcbiAgICB2YXIgZXhwID0gYXN0LmV4cHJlc3Npb24udmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMuX2FkZFJlY29yZChSZWNvcmRUeXBlLlByaW1pdGl2ZU9wLCBcIm9wZXJhdGlvbl9uZWdhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIENoYW5nZURldGVjdGlvblV0aWwub3BlcmF0aW9uX25lZ2F0ZSwgW2V4cF0sIG51bGwsIDApO1xuICB9XG5cbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IENvbmRpdGlvbmFsKTogbnVtYmVyIHtcbiAgICB2YXIgY29uZGl0aW9uID0gYXN0LmNvbmRpdGlvbi52aXNpdCh0aGlzKTtcbiAgICB2YXIgc3RhcnRPZkZhbHNlQnJhbmNoID0gW251bGxdO1xuICAgIHZhciBlbmRPZkZhbHNlQnJhbmNoID0gW251bGxdO1xuICAgIHRoaXMuX2FkZFJlY29yZChSZWNvcmRUeXBlLlNraXBSZWNvcmRzSWZOb3QsIFwiU2tpcFJlY29yZHNJZk5vdFwiLCBudWxsLCBbXSwgc3RhcnRPZkZhbHNlQnJhbmNoLFxuICAgICAgICAgICAgICAgICAgICBjb25kaXRpb24pO1xuICAgIHZhciB3aGVuVHJ1ZSA9IGFzdC50cnVlRXhwLnZpc2l0KHRoaXMpO1xuICAgIHZhciBza2lwID1cbiAgICAgICAgdGhpcy5fYWRkUmVjb3JkKFJlY29yZFR5cGUuU2tpcFJlY29yZHMsIFwiU2tpcFJlY29yZHNcIiwgbnVsbCwgW10sIGVuZE9mRmFsc2VCcmFuY2gsIDApO1xuICAgIHZhciB3aGVuRmFsc2UgPSBhc3QuZmFsc2VFeHAudmlzaXQodGhpcyk7XG4gICAgc3RhcnRPZkZhbHNlQnJhbmNoWzBdID0gc2tpcDtcbiAgICBlbmRPZkZhbHNlQnJhbmNoWzBdID0gd2hlbkZhbHNlO1xuXG4gICAgcmV0dXJuIHRoaXMuX2FkZFJlY29yZChSZWNvcmRUeXBlLlByaW1pdGl2ZU9wLCBcImNvbmRcIiwgQ2hhbmdlRGV0ZWN0aW9uVXRpbC5jb25kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgW2NvbmRpdGlvbiwgd2hlblRydWUsIHdoZW5GYWxzZV0sIG51bGwsIDApO1xuICB9XG5cbiAgdmlzaXRQaXBlKGFzdDogQmluZGluZ1BpcGUpOiBudW1iZXIge1xuICAgIHZhciB2YWx1ZSA9IGFzdC5leHAudmlzaXQodGhpcyk7XG4gICAgdmFyIGFyZ3MgPSB0aGlzLl92aXNpdEFsbChhc3QuYXJncyk7XG4gICAgcmV0dXJuIHRoaXMuX2FkZFJlY29yZChSZWNvcmRUeXBlLlBpcGUsIGFzdC5uYW1lLCBhc3QubmFtZSwgYXJncywgbnVsbCwgdmFsdWUpO1xuICB9XG5cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQpOiBudW1iZXIge1xuICAgIHZhciBvYmogPSBhc3Qub2JqLnZpc2l0KHRoaXMpO1xuICAgIHZhciBrZXkgPSBhc3Qua2V5LnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiB0aGlzLl9hZGRSZWNvcmQoUmVjb3JkVHlwZS5LZXllZFJlYWQsIFwia2V5ZWRBY2Nlc3NcIiwgQ2hhbmdlRGV0ZWN0aW9uVXRpbC5rZXllZEFjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFtrZXldLCBudWxsLCBvYmopO1xuICB9XG5cbiAgdmlzaXRDaGFpbihhc3Q6IENoYWluKTogbnVtYmVyIHtcbiAgICB2YXIgYXJncyA9IGFzdC5leHByZXNzaW9ucy5tYXAoZSA9PiBlLnZpc2l0KHRoaXMpKTtcbiAgICByZXR1cm4gdGhpcy5fYWRkUmVjb3JkKFJlY29yZFR5cGUuQ2hhaW4sIFwiY2hhaW5cIiwgbnVsbCwgYXJncywgbnVsbCwgMCk7XG4gIH1cblxuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgYENhdWdodCB1bmludGVycHJldGVkIGV4cHJlc3Npb24gYXQgJHthc3QubG9jYXRpb259OiAke2FzdC51bmludGVycHJldGVkRXhwcmVzc2lvbn0uIGAgK1xuICAgICAgICBgRXhwcmVzc2lvbiBwcmVmaXggJHthc3QucHJlZml4fSBkaWQgbm90IG1hdGNoIGEgdGVtcGxhdGUgdHJhbnNmb3JtZXIgdG8gaW50ZXJwcmV0IHRoZSBleHByZXNzaW9uLmApO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRBbGwoYXN0czogYW55W10pIHtcbiAgICB2YXIgcmVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGFzdHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFzdHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHJlc1tpXSA9IGFzdHNbaV0udmlzaXQodGhpcyk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGBQcm90b1JlY29yZGAgYW5kIHJldHVybnMgaXRzIHNlbGZJbmRleC5cbiAgICovXG4gIHByaXZhdGUgX2FkZFJlY29yZCh0eXBlLCBuYW1lLCBmdW5jT3JWYWx1ZSwgYXJncywgZml4ZWRBcmdzLCBjb250ZXh0KTogbnVtYmVyIHtcbiAgICB2YXIgc2VsZkluZGV4ID0gdGhpcy5fcmVjb3Jkcy5sZW5ndGggKyAxO1xuICAgIGlmIChjb250ZXh0IGluc3RhbmNlb2YgRGlyZWN0aXZlSW5kZXgpIHtcbiAgICAgIHRoaXMuX3JlY29yZHMucHVzaChuZXcgUHJvdG9SZWNvcmQodHlwZSwgbmFtZSwgZnVuY09yVmFsdWUsIGFyZ3MsIGZpeGVkQXJncywgLTEsIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGZJbmRleCwgdGhpcy5fYmluZGluZ1JlY29yZCwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRpbmdJbmRleCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZWNvcmRzLnB1c2gobmV3IFByb3RvUmVjb3JkKHR5cGUsIG5hbWUsIGZ1bmNPclZhbHVlLCBhcmdzLCBmaXhlZEFyZ3MsIGNvbnRleHQsIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGZJbmRleCwgdGhpcy5fYmluZGluZ1JlY29yZCwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRpbmdJbmRleCkpO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZkluZGV4O1xuICB9XG59XG5cblxuZnVuY3Rpb24gX2FycmF5Rm4obGVuZ3RoOiBudW1iZXIpOiBGdW5jdGlvbiB7XG4gIHN3aXRjaCAobGVuZ3RoKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuIENoYW5nZURldGVjdGlvblV0aWwuYXJyYXlGbjA7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIENoYW5nZURldGVjdGlvblV0aWwuYXJyYXlGbjE7XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIENoYW5nZURldGVjdGlvblV0aWwuYXJyYXlGbjI7XG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIENoYW5nZURldGVjdGlvblV0aWwuYXJyYXlGbjM7XG4gICAgY2FzZSA0OlxuICAgICAgcmV0dXJuIENoYW5nZURldGVjdGlvblV0aWwuYXJyYXlGbjQ7XG4gICAgY2FzZSA1OlxuICAgICAgcmV0dXJuIENoYW5nZURldGVjdGlvblV0aWwuYXJyYXlGbjU7XG4gICAgY2FzZSA2OlxuICAgICAgcmV0dXJuIENoYW5nZURldGVjdGlvblV0aWwuYXJyYXlGbjY7XG4gICAgY2FzZSA3OlxuICAgICAgcmV0dXJuIENoYW5nZURldGVjdGlvblV0aWwuYXJyYXlGbjc7XG4gICAgY2FzZSA4OlxuICAgICAgcmV0dXJuIENoYW5nZURldGVjdGlvblV0aWwuYXJyYXlGbjg7XG4gICAgY2FzZSA5OlxuICAgICAgcmV0dXJuIENoYW5nZURldGVjdGlvblV0aWwuYXJyYXlGbjk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBEb2VzIG5vdCBzdXBwb3J0IGxpdGVyYWwgbWFwcyB3aXRoIG1vcmUgdGhhbiA5IGVsZW1lbnRzYCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX21hcFByaW1pdGl2ZU5hbWUoa2V5czogYW55W10pIHtcbiAgdmFyIHN0cmluZ2lmaWVkS2V5cyA9IGtleXMubWFwKGsgPT4gaXNTdHJpbmcoaykgPyBgXCIke2t9XCJgIDogYCR7a31gKS5qb2luKCcsICcpO1xuICByZXR1cm4gYG1hcEZuKFske3N0cmluZ2lmaWVkS2V5c31dKWA7XG59XG5cbmZ1bmN0aW9uIF9vcGVyYXRpb25Ub1ByaW1pdGl2ZU5hbWUob3BlcmF0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuICBzd2l0Y2ggKG9wZXJhdGlvbikge1xuICAgIGNhc2UgJysnOlxuICAgICAgcmV0dXJuIFwib3BlcmF0aW9uX2FkZFwiO1xuICAgIGNhc2UgJy0nOlxuICAgICAgcmV0dXJuIFwib3BlcmF0aW9uX3N1YnRyYWN0XCI7XG4gICAgY2FzZSAnKic6XG4gICAgICByZXR1cm4gXCJvcGVyYXRpb25fbXVsdGlwbHlcIjtcbiAgICBjYXNlICcvJzpcbiAgICAgIHJldHVybiBcIm9wZXJhdGlvbl9kaXZpZGVcIjtcbiAgICBjYXNlICclJzpcbiAgICAgIHJldHVybiBcIm9wZXJhdGlvbl9yZW1haW5kZXJcIjtcbiAgICBjYXNlICc9PSc6XG4gICAgICByZXR1cm4gXCJvcGVyYXRpb25fZXF1YWxzXCI7XG4gICAgY2FzZSAnIT0nOlxuICAgICAgcmV0dXJuIFwib3BlcmF0aW9uX25vdF9lcXVhbHNcIjtcbiAgICBjYXNlICc9PT0nOlxuICAgICAgcmV0dXJuIFwib3BlcmF0aW9uX2lkZW50aWNhbFwiO1xuICAgIGNhc2UgJyE9PSc6XG4gICAgICByZXR1cm4gXCJvcGVyYXRpb25fbm90X2lkZW50aWNhbFwiO1xuICAgIGNhc2UgJzwnOlxuICAgICAgcmV0dXJuIFwib3BlcmF0aW9uX2xlc3NfdGhlblwiO1xuICAgIGNhc2UgJz4nOlxuICAgICAgcmV0dXJuIFwib3BlcmF0aW9uX2dyZWF0ZXJfdGhlblwiO1xuICAgIGNhc2UgJzw9JzpcbiAgICAgIHJldHVybiBcIm9wZXJhdGlvbl9sZXNzX29yX2VxdWFsc190aGVuXCI7XG4gICAgY2FzZSAnPj0nOlxuICAgICAgcmV0dXJuIFwib3BlcmF0aW9uX2dyZWF0ZXJfb3JfZXF1YWxzX3RoZW5cIjtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFVuc3VwcG9ydGVkIG9wZXJhdGlvbiAke29wZXJhdGlvbn1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfb3BlcmF0aW9uVG9GdW5jdGlvbihvcGVyYXRpb246IHN0cmluZyk6IEZ1bmN0aW9uIHtcbiAgc3dpdGNoIChvcGVyYXRpb24pIHtcbiAgICBjYXNlICcrJzpcbiAgICAgIHJldHVybiBDaGFuZ2VEZXRlY3Rpb25VdGlsLm9wZXJhdGlvbl9hZGQ7XG4gICAgY2FzZSAnLSc6XG4gICAgICByZXR1cm4gQ2hhbmdlRGV0ZWN0aW9uVXRpbC5vcGVyYXRpb25fc3VidHJhY3Q7XG4gICAgY2FzZSAnKic6XG4gICAgICByZXR1cm4gQ2hhbmdlRGV0ZWN0aW9uVXRpbC5vcGVyYXRpb25fbXVsdGlwbHk7XG4gICAgY2FzZSAnLyc6XG4gICAgICByZXR1cm4gQ2hhbmdlRGV0ZWN0aW9uVXRpbC5vcGVyYXRpb25fZGl2aWRlO1xuICAgIGNhc2UgJyUnOlxuICAgICAgcmV0dXJuIENoYW5nZURldGVjdGlvblV0aWwub3BlcmF0aW9uX3JlbWFpbmRlcjtcbiAgICBjYXNlICc9PSc6XG4gICAgICByZXR1cm4gQ2hhbmdlRGV0ZWN0aW9uVXRpbC5vcGVyYXRpb25fZXF1YWxzO1xuICAgIGNhc2UgJyE9JzpcbiAgICAgIHJldHVybiBDaGFuZ2VEZXRlY3Rpb25VdGlsLm9wZXJhdGlvbl9ub3RfZXF1YWxzO1xuICAgIGNhc2UgJz09PSc6XG4gICAgICByZXR1cm4gQ2hhbmdlRGV0ZWN0aW9uVXRpbC5vcGVyYXRpb25faWRlbnRpY2FsO1xuICAgIGNhc2UgJyE9PSc6XG4gICAgICByZXR1cm4gQ2hhbmdlRGV0ZWN0aW9uVXRpbC5vcGVyYXRpb25fbm90X2lkZW50aWNhbDtcbiAgICBjYXNlICc8JzpcbiAgICAgIHJldHVybiBDaGFuZ2VEZXRlY3Rpb25VdGlsLm9wZXJhdGlvbl9sZXNzX3RoZW47XG4gICAgY2FzZSAnPic6XG4gICAgICByZXR1cm4gQ2hhbmdlRGV0ZWN0aW9uVXRpbC5vcGVyYXRpb25fZ3JlYXRlcl90aGVuO1xuICAgIGNhc2UgJzw9JzpcbiAgICAgIHJldHVybiBDaGFuZ2VEZXRlY3Rpb25VdGlsLm9wZXJhdGlvbl9sZXNzX29yX2VxdWFsc190aGVuO1xuICAgIGNhc2UgJz49JzpcbiAgICAgIHJldHVybiBDaGFuZ2VEZXRlY3Rpb25VdGlsLm9wZXJhdGlvbl9ncmVhdGVyX29yX2VxdWFsc190aGVuO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5zdXBwb3J0ZWQgb3BlcmF0aW9uICR7b3BlcmF0aW9ufWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIHModik6IHN0cmluZyB7XG4gIHJldHVybiBpc1ByZXNlbnQodikgPyBgJHt2fWAgOiAnJztcbn1cblxuZnVuY3Rpb24gX2ludGVycG9sYXRpb25GbihzdHJpbmdzOiBhbnlbXSkge1xuICB2YXIgbGVuZ3RoID0gc3RyaW5ncy5sZW5ndGg7XG4gIHZhciBjMCA9IGxlbmd0aCA+IDAgPyBzdHJpbmdzWzBdIDogbnVsbDtcbiAgdmFyIGMxID0gbGVuZ3RoID4gMSA/IHN0cmluZ3NbMV0gOiBudWxsO1xuICB2YXIgYzIgPSBsZW5ndGggPiAyID8gc3RyaW5nc1syXSA6IG51bGw7XG4gIHZhciBjMyA9IGxlbmd0aCA+IDMgPyBzdHJpbmdzWzNdIDogbnVsbDtcbiAgdmFyIGM0ID0gbGVuZ3RoID4gNCA/IHN0cmluZ3NbNF0gOiBudWxsO1xuICB2YXIgYzUgPSBsZW5ndGggPiA1ID8gc3RyaW5nc1s1XSA6IG51bGw7XG4gIHZhciBjNiA9IGxlbmd0aCA+IDYgPyBzdHJpbmdzWzZdIDogbnVsbDtcbiAgdmFyIGM3ID0gbGVuZ3RoID4gNyA/IHN0cmluZ3NbN10gOiBudWxsO1xuICB2YXIgYzggPSBsZW5ndGggPiA4ID8gc3RyaW5nc1s4XSA6IG51bGw7XG4gIHZhciBjOSA9IGxlbmd0aCA+IDkgPyBzdHJpbmdzWzldIDogbnVsbDtcbiAgc3dpdGNoIChsZW5ndGggLSAxKSB7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIChhMSkgPT4gYzAgKyBzKGExKSArIGMxO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiAoYTEsIGEyKSA9PiBjMCArIHMoYTEpICsgYzEgKyBzKGEyKSArIGMyO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiAoYTEsIGEyLCBhMykgPT4gYzAgKyBzKGExKSArIGMxICsgcyhhMikgKyBjMiArIHMoYTMpICsgYzM7XG4gICAgY2FzZSA0OlxuICAgICAgcmV0dXJuIChhMSwgYTIsIGEzLCBhNCkgPT4gYzAgKyBzKGExKSArIGMxICsgcyhhMikgKyBjMiArIHMoYTMpICsgYzMgKyBzKGE0KSArIGM0O1xuICAgIGNhc2UgNTpcbiAgICAgIHJldHVybiAoYTEsIGEyLCBhMywgYTQsIGE1KSA9PlxuICAgICAgICAgICAgICAgICBjMCArIHMoYTEpICsgYzEgKyBzKGEyKSArIGMyICsgcyhhMykgKyBjMyArIHMoYTQpICsgYzQgKyBzKGE1KSArIGM1O1xuICAgIGNhc2UgNjpcbiAgICAgIHJldHVybiAoYTEsIGEyLCBhMywgYTQsIGE1LCBhNikgPT5cbiAgICAgICAgICAgICAgICAgYzAgKyBzKGExKSArIGMxICsgcyhhMikgKyBjMiArIHMoYTMpICsgYzMgKyBzKGE0KSArIGM0ICsgcyhhNSkgKyBjNSArIHMoYTYpICsgYzY7XG4gICAgY2FzZSA3OlxuICAgICAgcmV0dXJuIChhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNykgPT4gYzAgKyBzKGExKSArIGMxICsgcyhhMikgKyBjMiArIHMoYTMpICsgYzMgKyBzKGE0KSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjNCArIHMoYTUpICsgYzUgKyBzKGE2KSArIGM2ICsgcyhhNykgKyBjNztcbiAgICBjYXNlIDg6XG4gICAgICByZXR1cm4gKGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3LCBhOCkgPT4gYzAgKyBzKGExKSArIGMxICsgcyhhMikgKyBjMiArIHMoYTMpICsgYzMgKyBzKGE0KSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYzQgKyBzKGE1KSArIGM1ICsgcyhhNikgKyBjNiArIHMoYTcpICsgYzcgKyBzKGE4KSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYzg7XG4gICAgY2FzZSA5OlxuICAgICAgcmV0dXJuIChhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNywgYTgsIGE5KSA9PiBjMCArIHMoYTEpICsgYzEgKyBzKGEyKSArIGMyICsgcyhhMykgKyBjMyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMoYTQpICsgYzQgKyBzKGE1KSArIGM1ICsgcyhhNikgKyBjNiArIHMoYTcpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYzcgKyBzKGE4KSArIGM4ICsgcyhhOSkgKyBjOTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYERvZXMgbm90IHN1cHBvcnQgbW9yZSB0aGFuIDkgZXhwcmVzc2lvbnNgKTtcbiAgfVxufVxuIl19