import { Group } from 'konva/lib/Group';
import { Tool } from '../Tool';
import { TFrameType } from '../types/FrameMark';
import { CommEvents } from './events/index';
import Konva from 'konva';
import { removeRectActive } from './utils';
import { KonvaEventObject } from 'konva/lib/Node';

export class FrameMark extends Tool {
  currFrameType?: TFrameType = null;
  limitFrame: number = -1;
  disabledAddNode: boolean = false;
  commEvents: CommEvents;
  konvaFarmesGroup: Group;
  selectedGroup: Group;
  minArea: number = -1;

  constructor() {
    super();
    this.konvaStage.on('mousedown touchstart', (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      const { target } = e;
      if (target === this.konvaBackgroundImage || this.konvaStage === target) {
        removeRectActive(this.konvaFarmesGroup);
        this.selectedGroup = null;
      }
    });
    this.commEvents = new CommEvents(this);
  }

  async beginDraw(imgSrc: string, json?: string | Object) {
    const _type = this.currFrameType;

    if (json) {
      await this._createByJson(imgSrc, json as any);
    } else {
      this.reset();
      await this.drawBackgroundImage(imgSrc);
      this.konvaFarmesGroup = new Konva.Group({
        width: this.konvaBackgroundImage.width(),
        height: this.konvaBackgroundImage.height(),
        x: 0,
        y: 0,
        id: 'farmes'
      });
      this.konvaContextGroup.add(this.konvaFarmesGroup);
    }
    this.toLeftTopPoint();
    this.switchFrameType(_type);
    this._switchContextDraggable();
    removeRectActive(this.konvaFarmesGroup);
  }

  switchFrameType(type?: TFrameType) {
    removeRectActive(this.konvaFarmesGroup);
    this.selectedGroup = null;
    this.currFrameType = type;
    this.commEvents?.removeListener && this.commEvents.removeListener();

    if (!this.currFrameType || this.getIsDisabled()) {
      this.konvaContextGroup.draggable(true);
    } else {
      this.konvaContextGroup.draggable(false);
      this.commEvents.handleEvent();
    }
  }

  async _createByJson(imgSrc: string, json: any) {
    await this.loadJSON(json, imgSrc);
    this.konvaFarmesGroup = this.konvaContextGroup.findOne('#farmes');
    this.commEvents.eachMarkEvent();
  }

  getIsDisabled () {
    return this.disabledAddNode || this.getIsLimit() || this.disabled;
  }

  getIsLimit () {
    if (this.limitFrame === -1) return false;
    return this.konvaFarmesGroup.children.length >= this.limitFrame;
  }

  setDisabled(_disabled: boolean) {
    super.disabled = _disabled;
    this.commEvents.toggleRectangleEventStatus(_disabled);
  }

  setDisabledAddNode(_disabled = false) {
    this.disabled = _disabled;
    this._switchContextDraggable();
  }

  setLimit(_limit: number = -1) {
    this.limitFrame = _limit;
    this._switchContextDraggable();
  }

  reset() {
    super.reset();
    if (this.konvaFarmesGroup) {
      this.konvaFarmesGroup.destroy();
      this.konvaFarmesGroup.remove();
      this.konvaFarmesGroup = null;
    }
  }

  removeSelectedGroup() {
    if (this.selectedGroup) {
      this.selectedGroup.remove();
      this.selectedGroup = null;
      this._switchContextDraggable();
    }
  }

  _switchContextDraggable () {
    const status = this.currFrameType === null || this.getIsDisabled();
    this.konvaContextGroup.draggable(status);
  }
}
