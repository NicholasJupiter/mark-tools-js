import { KonvaEventObject } from 'konva/lib/Node';
import { Rect } from 'konva/lib/shapes/Rect';
import Konva from 'konva';
import { Group } from 'konva/lib/Group';
import { Box, Transformer } from 'konva/lib/shapes/Transformer';
import { FrameMark } from '../FrameMark';
import { calcPosition, getPointerPosition, moveStageView, removeRectActive } from '../utils';

export const handleRectEvent = (frameMark: FrameMark) => {
  const { konvaStage, konvaFarmesGroup, konvaContextGroup } = frameMark;
  let isMoveing = false;
  let currRectGroup: Group;
  let currRect: Rect;

  const startEventName = 'mousedown touchstart';
  const moveEventName = 'mousemove touchmove';
  const endEventName = 'mouseup touchend';
  const startOffset = { x: 0, y: 0 };

  const onTouchStart = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const { target } = e;
    if (!target.parent || target.className !== 'Image') return;
    // double touch
    if ((e.evt as any)?.touches?.length === 2) {
      return;
    }
    removeRectActive(konvaFarmesGroup);
    frameMark.selectedGroup = null;
    if (frameMark.getIsDisabled()) return;
    const { offsetX, offsetY } = getPointerPosition(konvaStage, konvaContextGroup);
    startOffset.x = offsetX;
    startOffset.y = offsetY;
    isMoveing = true;
    const color = Konva.Util.getRandomColor();
    currRectGroup = new Konva.Group({
      attrs: {
        type: 'rect-group'
      }
    });

    // create rect node
    currRect = new Konva.Rect({
      x: offsetX,
      y: offsetY,
      fill: color + 'B2',
      strokeEnabled: true,
      draggable: true
    });

    // add transformation
    const transformer = new Konva.Transformer({
      nodes: [currRect],
      enabledAnchors: [
        'top-center',
        'top-left',
        'top-right',
        'middle-left',
        'middle-right',
        'bottom-left',
        'bottom-right',
        'bottom-center'
      ],
      rotateEnabled: false,
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
      resizeEnabled: false,
      borderStrokeWidth: 2,
      borderStroke: color
    });
    addRectEvent(currRect, frameMark);
    addRectTransformerEvent(transformer, frameMark);

    currRectGroup.add(currRect, transformer);
    konvaFarmesGroup.add(currRectGroup);
  };

  const onTouchMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const { target } = e;
    if (!target.parent) return;
    if (!isMoveing) return;
    if ((e.evt as any)?.touches?.length === 2) {
      return;
    }
    const { offsetX, offsetY } = getPointerPosition(konvaStage, konvaContextGroup);
    const { width, height, x, y } = calcPosition(startOffset, offsetX, offsetY);
    currRect.width(width);
    currRect.height(height);
    currRect.x(x);
    currRect.y(y);
    moveStageView(konvaStage);
  };

  const onTouchEnd = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const { offsetX, offsetY } = getPointerPosition(konvaStage, konvaContextGroup);
    isMoveing = false;
    if (!isAreaSufficient({ offsetX, offsetY }) && currRectGroup) {
      currRectGroup.remove();
    }
    currRectGroup = null;
    currRect = null;
    setTimeout(() => {
      frameMark._switchContextDraggable();
    }, 10);
    frameMark.emit('change', e, currRect, frameMark);
  };

  const isAreaSufficient = ({ offsetX, offsetY }) => {
    if (frameMark.minArea === -1) return true;
    const { x, y } = startOffset;
    const _x = Math.abs(offsetX - x);
    const _y = Math.abs(offsetY - y);
    if (_x === 0 || _y === 0) return false;
    return _x * _y > frameMark.minArea;
  };

  konvaStage.on(startEventName, onTouchStart);
  konvaStage.on(moveEventName, onTouchMove);
  konvaStage.on(endEventName, onTouchEnd);

  return () => {
    konvaStage.off(startEventName, onTouchStart);
    konvaStage.off(moveEventName, onTouchMove);
    konvaStage.off(endEventName, onTouchEnd);
  };
};

const onRectDragMove = (e, frameMark: FrameMark) => {};

const onTransform = (e: KonvaEventObject<MouseEvent | TouchEvent>, frameMark: FrameMark) => {
  const { konvaStage } = frameMark;
  moveStageView(konvaStage);
};

const onRectClick = (e: KonvaEventObject<MouseEvent | TouchEvent>, frameMark: FrameMark) => {
  const { konvaFarmesGroup } = frameMark;
  removeRectActive(konvaFarmesGroup);
  if (frameMark.disabled) return;
  frameMark.selectedGroup = e.currentTarget.parent as Group;
  const transformer = e.currentTarget.parent.getChildren((item) => {
    return item.className === 'Transformer';
  })[0] as Transformer;
  transformer.resizeEnabled(true);
  transformer.rotateEnabled(true);
  e.currentTarget.parent.moveToTop();
};

function konvaDragBoundFunc(this: Rect | Transformer, pos: Box, frameMark: FrameMark) {
  const { konvaContextGroup, konvaStage, konvaBackgroundImage } = frameMark;
  let { x, y } = konvaContextGroup.getAbsolutePosition();
  const scaleX = konvaStage.scaleX();
  const scaleY = konvaStage.scaleY();

  const imageWidth = konvaBackgroundImage.width();
  const imageHeight = konvaBackgroundImage.height();
  const width = this.width() * this.scaleX();
  const height = this.height() * this.scaleY();

  const maxX = (imageWidth - width) * scaleX + x;
  const maxY = (imageHeight - height) * scaleY + y;
  const newX = Math.max(x, Math.min(pos.x, maxX));
  const newY = Math.max(y, Math.min(pos.y, maxY));

  return { x: newX, y: newY };
}

function transformerBoundBoxFunc(
  this: Transformer,
  oldBox: Box,
  newBox: Box,
  frameMark: FrameMark
) {
  const { konvaBackgroundImage } = frameMark;
  const imageRect = konvaBackgroundImage.getClientRect();

  const startX = Number(Math.max(0, newBox.x - imageRect.x).toFixed(6));
  const startY = Number(Math.max(0, newBox.y - imageRect.y).toFixed(6));

  const imgWidth = imageRect.width;
  const imgHeight = imageRect.height;

  const boxAbsolutePosition = {
    x: startX,
    y: startY,
    right: startX + newBox.width,
    bottom: startY + newBox.height,
    canMaxWidth: imgWidth - startX,
    canMaxHeight: imgHeight - startY
  };

  const imgRight = imageRect.width + imageRect.x;
  const imgBottom = imageRect.height + imageRect.y;

  const isOverWidth = newBox.x + newBox.width > imgWidth + imageRect.x || newBox.width > imgWidth;
  const isOverHeight =
    newBox.y + newBox.height > imgHeight + imageRect.y || newBox.height > imgHeight;

  let width = isOverWidth ? boxAbsolutePosition.canMaxWidth : newBox.width;
  let height = isOverHeight ? boxAbsolutePosition.canMaxHeight : newBox.height;
  width = Math.max(2, Math.abs(width));
  height = Math.max(2, Math.abs(height));
  const x = Math.max(Math.min(newBox.x, imgRight - width), imageRect.x);
  const y = Math.max(Math.min(newBox.y, imgBottom - height), imageRect.y);

  const limitedBox = {
    x,
    y,
    width,
    height,
    rotation: newBox.rotation
  };

  return limitedBox;
}

export const addRectEvent = (currRect: Rect, frameMark: FrameMark) => {
  currRect.on('click tap', (e) => onRectClick(e, frameMark));
  currRect.on('dragmove', (e) => onRectDragMove(e, frameMark));

  currRect.on('touchend mouseup', (e) => {
    frameMark.emit('change', e, currRect, frameMark);
  });

  currRect.dragBoundFunc(function (pos) {
    return konvaDragBoundFunc.call(this, pos, frameMark);
  });
};

export const addRectTransformerEvent = (transformer: Transformer, frameMark: FrameMark) => {
  transformer.on('transform', (e) => onTransform(e, frameMark));
  transformer.on('touchend mouseup', (e) => {
    frameMark.emit('change', e, transformer, frameMark);
  });
  transformer.boundBoxFunc(function (oldBox, newBox) {
    return transformerBoundBoxFunc.call(this, oldBox, newBox, frameMark);
  });
};
