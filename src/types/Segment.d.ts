
export type x = number;
export type y = number;
export type width = number;
export type height = number;

export type TSliceImageData = {
  x;
  y;
  w: width;
  h: height;
  rgba: [number, number, number, number];
  image?: string;
};

export type THandledSegmentation = {
  isChecked: boolean;
  splitedSegmentation: [x, y];
};

export type TImageCategory = {
  cat_id: number;
  cat_name: string;
}

export type TImageCategorysData = {
  segmentation: number[][];
  handledSegmentation?: THandledSegmentation[],
  fillColor?: string;
  bbox: number[];
};

export type TImageData = {
  width: width;
  height: height;
  url: string;
  categorys: TImageCategorysData[]
};


export type ClickPosition = {
  x: number;
  y: number;
};

export type TSliceImageJson = { [k in string]: TSliceImageData };
