import { addRectEvent, addRectTransformerEvent, handleRectEvent } from './rectangle';
import { FrameMark } from '../FrameMark';
import { Group } from 'konva/lib/Group';
import { Transformer } from 'konva/lib/shapes/Transformer';
import { Rect } from 'konva/lib/shapes/Rect';

export class CommEvents {
  frameMark: FrameMark;
  _removeListener: () => any;

  constructor(frameMark: FrameMark) {
    this.frameMark = frameMark;
  }

  handleEvent() {
    if (this.frameMark.currFrameType === 'rect') {
      this._removeListener = handleRectEvent(this.frameMark);
    }
  }

  eachMarkEvent() {
    const { konvaFarmesGroup } = this.frameMark;
    for (const nodeGroup of konvaFarmesGroup.children) {
      this._initRectangleEvents(nodeGroup as Group);
    }
  }

  removeListener() {
    this._removeListener?.();
    this._removeListener = null;
  }

  _initRectangleEvents(nodeGroup: Group) {
    const { attrs } = nodeGroup;
    if (attrs.type === 'rect-group') {
      let rectNode: Rect = null;
      const children = (nodeGroup as Group).children;
      for (const child of children) {
        const { className } = child;
        switch (className) {
          case 'Rect':
            addRectEvent(child as Rect, this.frameMark);
            rectNode = child as Rect;
            break;
          case 'Transformer':
            addRectTransformerEvent(child as Transformer, this.frameMark);
            rectNode && (child as Transformer).nodes([rectNode]);
            break;
        }
      }
    }
  }
  
  toggleRectangleEventStatus(disabled: boolean) {
    const { konvaFarmesGroup } = this.frameMark;
    for (const nodeGroup of konvaFarmesGroup.children) {
      const { attrs } = nodeGroup;
      if (attrs.type === 'rect-group') {
        const children = (nodeGroup as Group).children;
        for (const child of children) {
          const { className } = child;
          switch (className) {
            case 'Rect':
              const rect = child as Rect;
              rect.draggable(!disabled);
              break;
            case 'Transformer':
              const transformer = child as Transformer;
              transformer.resizeEnabled(false);
              transformer.rotateEnabled(false);
              break;
          }
        }
      }
    }
  }
}
