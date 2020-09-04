import { expect } from 'chai';
import Stack from '../../stack';

describe('Stack', () => {
  let stack: Stack<string>;

  beforeEach(() => {
    stack = new Stack();
  });

  it('stacks the first object', () => {
    const parent = 'parent';
    stack.push(parent);

    expect(stack.size()).to.be.eq(1);
    expect(stack.peek()).to.be.eq(parent);
  });

  it('stacks some objects', () => {
    const parent = 'parent';
    const child = 'child';
    const grandchild = 'grandchild';
    stack.push(parent);
    stack.push(child);
    stack.push(grandchild);

    expect(stack.size()).to.be.eq(3);
    expect(stack.peek()).to.be.eq(grandchild);
    stack.pop();
    expect(stack.peek()).to.be.eq(child);
    stack.pop();
    expect(stack.peek()).to.be.eq(parent);
  });

  it('unstacks an object', () => {
    const parent = 'parent';
    const child = 'child';
    const grandchild = 'grandchild';
    stack.push(parent);
    stack.push(child);
    stack.push(grandchild);
    stack.pop();

    expect(stack.size()).to.be.eq(2);
    expect(stack.peek()).to.be.eq(child);
    stack.pop();
    expect(stack.peek()).to.be.eq(parent);
  });

  it('unstacks specific an object', () => {
    const parent = 'parent';
    const child = 'child';
    const grandchild = 'grandchild';
    stack.push(parent);
    stack.push(child);
    stack.push(grandchild);
    stack.pop(grandchild);

    expect(stack.size()).to.be.eq(2);
    expect(stack.peek()).to.be.eq(child);
  });

  it('unstacks a specific middle object', () => {
    const parent = 'parent';
    const child = 'child';
    const grandchild = 'grandchild';
    stack.push(parent);
    stack.push(child);
    stack.push(grandchild);
    const { element, collateral } = stack.pop(child);

    expect(stack.size()).to.be.eq(1);
    expect(stack.peek()).to.be.eq(parent);
    expect(element).to.be.eq(child);
    expect(collateral).to.be.deep.eq([grandchild]);
  });

  it('unstacks the last object', () => {
    const parent = 'parent';
    stack.push(parent);
    stack.pop();

    expect(stack.size()).to.be.eq(0);
  });

  it('tries to unstack when have no object', () => {
    stack.pop();
    expect(stack.size()).to.be.eq(0);
  });

  it('tries to unstack specific when dont have the object and empty stack', () => {
    stack.pop('some object');
    expect(stack.size()).to.be.eq(0);
  });

  it('tries to unstack specific when dont have the object with filled stack', () => {
    const parent = 'parent';
    stack.push(parent);
    stack.pop('some object');
    expect(stack.size()).to.be.eq(0);
  });
});

