import { definePrototype } from '@proto.ui/core';
import { asTransition } from './as-transition';

/**
 * Transition 组件原型
 *
 * 基础动画过渡组件，提供状态机驱动的 presence 生命周期管理。
 * 适用于 Dialog、Toast、Dropdown 等需要受控进入/离开动画的场景。
 *
 * 状态机：closed → entering → entered → leaving → closed
 *
 * 注意：这是一个底层基础组件，通常不会被组件库直接暴露给终端用户，
 * 而是作为构建更高级组件（如 Dialog、Toast）的基础。
 */
export const transition = definePrototype({
  name: 'base-transition',
  setup() {
    // P-BASE-TRANSITION-AUTHORING-ENTRIES, P-BASE-TRANSITION-STANDALONE
    asTransition();
    // P-BASE-TRANSITION-HOST-NEUTRAL
    // Transition 本身不创建语义元素或宿主动画引擎，只透明保留调用者内容。
    return (r) => r.slot();
  },
});

export default transition;
