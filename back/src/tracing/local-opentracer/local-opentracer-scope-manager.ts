import Stack from '../stack';
import { LocalOpentracerSpan } from './local-opentracer-span';


export class LocalScopeManager {
  private stack: Stack<LocalOpentracerSpan>;

  public constructor() {
    this.stack = new Stack();
  }

  public activate(span: LocalOpentracerSpan): void {
    this.stack.push(span);
  }

  public getActive(): LocalOpentracerSpan | null {
    return this.stack.peek();
  }

  public deactivate(span): {element?: LocalOpentracerSpan; collateral?: LocalOpentracerSpan[]} {
    return this.stack.pop(span);
  }

  public clear(): void {
    this.stack = new Stack();
  }
}
