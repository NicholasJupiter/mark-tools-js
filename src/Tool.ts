import Konva from 'konva';
import { Layer } from 'konva/lib/Layer';
import { Stage } from 'konva/lib/Stage';
import { checkMobile, loadImage } from './utils';
import { Image } from 'konva/lib/shapes/Image';
import { Group } from 'konva/lib/Group';
import { EventEmitter } from 'events';
import { Node } from 'konva/lib/Node';
export class Tool {
  $container: HTMLDivElement;
  $cutPictureCanvasContainer: HTMLDivElement;
  imgSrc: string;
  konvaLayer: Layer;
  konvaStage: Stage;
  konvaBackgroundImage: Image;
  konvaContextGroup: Group;
  disabled: boolean; 
  events?: EventEmitter;
  on: EventEmitter['on'];
  off: EventEmitter['off'];
  emit: EventEmitter['emit'];

  constructor() {
    const $container = document.querySelector('#mark-container');
    if (!$container) {
      throw 'Segment container not found.';
    }
    this.$container = $container as HTMLDivElement;
    this.$cutPictureCanvasContainer = this.$container.querySelector('#mark-canvas-container');
    this.konvaStage = new Konva.Stage({
      container: this.$cutPictureCanvasContainer,
      width: window.innerWidth,
      height: window.innerHeight
    });
    this.konvaStage.clear();

    this.konvaLayer = new Konva.Layer({});
    this.konvaContextGroup = new Konva.Group({
      draggable: true,
      x: 0,
      y: 0
    });
    this.konvaStage.add(this.konvaLayer);
    // this.konvaLayer.add(this.konvaContextGroup);

    this.events = new EventEmitter();
    this.on = this.events.on.bind(this.events);
    this.off = this.events.off.bind(this.events);
    this.emit = this.events.emit.bind(this.events);
  }

  toLeftTopPoint() {
    this.konvaContextGroup.x(0);
    this.konvaContextGroup.y(0);
    this.konvaStage.position({ x: 0, y: 0 });
    this.konvaStage.scale({ x: 1, y: 1 });
  }

  reset() {
    this.konvaBackgroundImage && this.konvaBackgroundImage.remove();
    this.konvaContextGroup && this.konvaContextGroup.remove();
    this.konvaLayer.removeChildren();
    this.konvaLayer.destroyChildren();
    this.konvaStage.draw();
  }

  toJSON() {
    return this.konvaContextGroup.toJSON();
  }

  async loadJSON(json: any, imgSrc: string) {
    this.reset();
    const groupContextNode = Konva.Node.create(json) as Group;
    this.konvaContextGroup = groupContextNode;
    this.konvaBackgroundImage = this.konvaContextGroup.findOne('#background-image') as Konva.Image;
    const $img = await loadImage(imgSrc);
    this.konvaBackgroundImage.image($img);
    this.konvaLayer.add(this.konvaContextGroup);
    if (checkMobile()) {
      this._addMobileScaleEvent();
    } else {
      this._addPcScaleEvent();
    }
  }

  async drawBackgroundImage(imgSrc: string) {
    const $img = await this._loadImage(imgSrc);
    this.konvaBackgroundImage = new Konva.Image({
      image: $img,
      width: $img.width,
      height: $img.height,
      id: 'background-image'
    });
    this.konvaContextGroup.width($img.width);
    this.konvaContextGroup.height($img.height);

    this.konvaContextGroup.add(this.konvaBackgroundImage);
    this.konvaLayer.add(this.konvaContextGroup);
    if (checkMobile()) {
      this._addMobileScaleEvent();
    } else {
      this._addPcScaleEvent();
    }
  }

  /**
   * events on and returns off function
   * @param eventName
   * @param listener
   * @returns
   */
  _on(eventName: string | symbol, listener: (...args: any[]) => void) {
    this.on(eventName, listener);
    return () => {
      this.off(eventName, listener);
    };
  }

  _loadImage(imgSrc: string) {
    this.imgSrc = imgSrc;
    return loadImage(this.imgSrc);
  }

  _addPcScaleEvent() {
    const stage = this.konvaStage;

    const minScale = 0.8; // Minimum zoom ratio
    const maxScale = 10; // Maximum zoom ratio
    const scaleBy = 1.02; // Scaling factor, adjustable according to needs

    stage.on('wheel', (e) => {
      e.evt.preventDefault();
      const delta = Math.sign(e.evt.deltaY);
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale
      };
      let newScale = delta > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      // Restrict scaling within the specified range
      newScale = Math.max(minScale, Math.min(maxScale, newScale));

      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale
      };

      stage.position(newPos);
      // Shrink back to the original position
      if (newScale <= 1) {
        stage.position({ x: 0, y: 0 });
      }
      stage.batchDraw();
    });
  }

  _addMobileScaleEvent() {
    const stage = this.konvaStage;
    const group = this.konvaContextGroup;

    const minScale = 0.8; // Minimum zoom ratio
    const maxScale = 10; // Maximum zoom ratio

    let lastScale = 1; // Last Zoom Scale
    let initialDistance = 0; // Distance between initial touch points
    let initialScale = 1; // Initial scaling ratio
    let initialCenter = { x: 0, y: 0 }; // Initial touch center point position

    stage.on('touchstart', (e) => {
      const touches = e.evt.touches;

      // If there are two touch points
      if (touches.length === 2) {
        group.draggable(false);
        const touch1 = touches[0];
        const touch2 = touches[1];

        // Calculate the distance between initial touch points
        initialDistance = getDistance(
          touch1.clientX,
          touch1.clientY,
          touch2.clientX,
          touch2.clientY
        );

        // Calculate the initial touch center point position
        initialCenter = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2
        };

        // Record the initial scaling ratio and the previous scaling ratio
        initialScale = stage.scaleX();
        lastScale = initialScale;
      }
    });

    stage.on('touchmove', (e) => {
      const touches = e.evt.touches;

      // If there are two touch points
      if (touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];

        // Calculate the distance between the current touch points
        const currentDistance = getDistance(
          touch1.clientX,
          touch1.clientY,
          touch2.clientX,
          touch2.clientY
        );

        // Calculate scaling changes
        const scaleChange = currentDistance / initialDistance;

        // Calculate the current zoom ratio
        let scale = initialScale * scaleChange;

        // Restrict scaling within the specified range
        scale = Math.max(minScale, Math.min(maxScale, scale));

        // Calculate the position of the zoom center point relative to the stage
        const center = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2
        };

        // Update the scaling and position of the stage
        stage.scale({ x: scale, y: scale });
        stage.position({
          x: center.x - (center.x - stage.x()) * (scale / lastScale),
          y: center.y - (center.y - stage.y()) * (scale / lastScale)
        });

        lastScale = scale;

        stage.batchDraw();
      }
    });
    stage.on('touchend', (e) => {
      group.draggable(true);
    });

    // Calculate the distance between two points
    function getDistance(x1: number, y1: number, x2: number, y2: number) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    }
  }

  getKonvaNodePostion(node: Node, offset = { x: 0, y: 0 }) {
    const scalex = this.konvaStage.scaleX();
    const scaley = this.konvaStage.scaleY();
    const { x, y } = node.getAbsolutePosition();
    return {
      x: (offset.x - x) / scalex,
      y: (offset.y - y) / scaley
    };
  }
}
