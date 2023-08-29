import { THandledSegmentation, TImageCategorysData, TImageData, TSliceImageData, TSliceImageJson } from 'src/types/Segment';

export function loadImage(imgSrc: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    if (!imgSrc)
      rej({
        msg: 'not found image.'
      });
    const img = new Image();
    img.onload = () => {
      res(img);
    };
    img.onerror = (err) => {
      rej(err);
    };
    img.src = imgSrc;
  });
}

export const getSliceImageData = (
  imgs: { [k in string]: string },
  jsons: TSliceImageJson
): TSliceImageData[] => {
  return Object.keys(imgs).map((key) => ({
    image: imgs[key],
    ...jsons[key]
  }));
};

export const splitSegmentation =
  (segmentation: TImageCategorysData['segmentation'])
    : THandledSegmentation[] => {
    const ret = (segmentation as number[][]).map((seg: number[]) => {
      const totalPage = Math.round(seg.length / 2);
      const r = [];
      for (let i = 0; i < totalPage; i++) {
        const [x, y] = seg.slice(i * 2, (i + 1) * 2);
        r.push([x, y]);
      }
      return r;
    });
    return ret as Array<any>;
  };


export const checkMobile = () => {
  const info = navigator.userAgent;
  const agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPod', 'iPad'];
  for (let i = 0; i < agents.length; i += 1) {
    if (info.indexOf(agents[i]) >= 0) return true;
  }
  return false;
}