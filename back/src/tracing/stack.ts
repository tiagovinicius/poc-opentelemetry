export default class Stack<T> {
  private stack: T[];

  public constructor() {
    this.stack = [];
  }

  public isEmpty(): boolean {
    return this.stack.length === 0;
  }

  public pop(o?: T | null): {element?: T; collateral?: T[]} {
    if (this.isEmpty()) {
      return {};
    }

    if (!o) {
      return { element: this.stack.pop() };
    }

    const toPop = o || this.peek();
    const collateral: any[] = [];
    let head = this.stack.pop();
    while (head && head !== toPop) {
      collateral.push(head);
      head = this.stack.pop();
    }

    return { element: head, collateral: [...collateral] };
  }

  public push(o): void {
    this.stack.push(o);
  }

  public peek(): T | null {
    return !this.isEmpty() ? this.stack[this.stack.length - 1] : null;
  }

  public size(): number {
    return this.stack.length;
  }
}
