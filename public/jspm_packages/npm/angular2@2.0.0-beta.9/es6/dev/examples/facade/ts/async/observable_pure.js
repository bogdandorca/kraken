/* */ 
"format cjs";
import { Observable } from 'rxjs/Rx';
import { map } from 'rxjs/operator/map';
var obs = new Observable((sub) => {
    var i = 0;
    setInterval(_ => sub.next(++i), 1000);
});
map.call(obs, (i) => `${i} seconds elapsed`).subscribe((msg) => console.log(msg));
// #enddocregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YWJsZV9wdXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvZmFjYWRlL3RzL2FzeW5jL29ic2VydmFibGVfcHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FDTyxFQUFDLFVBQVUsRUFBYSxNQUFNLFNBQVM7T0FDdkMsRUFBQyxHQUFHLEVBQUMsTUFBTSxtQkFBbUI7QUFFckMsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQVMsQ0FBQyxHQUF1QjtJQUN2RCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixXQUFXLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4QyxDQUFDLENBQUMsQ0FBQztBQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBUyxLQUFLLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQVcsS0FBSyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEcsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gI2RvY3JlZ2lvbiBPYnNlcnZhYmxlXG5pbXBvcnQge09ic2VydmFibGUsIFN1YnNjcmliZXJ9IGZyb20gJ3J4anMvUngnO1xuaW1wb3J0IHttYXB9IGZyb20gJ3J4anMvb3BlcmF0b3IvbWFwJztcblxudmFyIG9icyA9IG5ldyBPYnNlcnZhYmxlPG51bWJlcj4oKHN1YjogU3Vic2NyaWJlcjxudW1iZXI+KSA9PiB7XG4gIHZhciBpID0gMDtcbiAgc2V0SW50ZXJ2YWwoXyA9PiBzdWIubmV4dCgrK2kpLCAxMDAwKTtcbn0pO1xubWFwLmNhbGwob2JzLCAoaTogbnVtYmVyKSA9PiBgJHtpfSBzZWNvbmRzIGVsYXBzZWRgKS5zdWJzY3JpYmUoKG1zZzogc3RyaW5nKSA9PiBjb25zb2xlLmxvZyhtc2cpKTtcbi8vICNlbmRkb2NyZWdpb25cbiJdfQ==