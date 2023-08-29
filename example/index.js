import { FrameMark } from '../src/index'
import './index.less'
import testData from './assets/test.json'
import png2 from './assets/2.jpg'
import { testJSON } from './test'

testData.url = png2

console.log(testData, png2)
const mark = new FrameMark()

window.mark = mark

const writeInfo = () => {
  const $info = document.querySelector('#info')
  $info.innerHTML = `
    <p>disabled: ${mark.disabled}</p>
    <p>limit: ${mark.limitFrame}</p>
    <p>type: ${mark.currFrameType}</p>
    <p>disabledAddNode: ${mark.disabledAddNode}</p>
  `
}

writeInfo()

mark.beginDraw(
  'https://publicai-dev.s3.ap-east-1.amazonaws.com/static/objectdetection/2ec204f5-4f66-43b9-aa8b-36e46ad6c253.jpg'
)
// mark.c(testJSON)

// mark.beginDraw(png2).then(() => {
//   // mark.switchFrameType('rect')
// })

window.onswitch = () => {
  console.log(png2, testJSON)

  mark.beginDraw(png2, testJSON)
}

window.addEventListener('load', () => {
  document.body.style.height = window.innerHeight + 'px'
})

window.onRect = () => {
  mark.switchFrameType('rect')
  writeInfo()
}

window.onPointer = () => {
  mark.switchFrameType()
  writeInfo()
}

window.onRemove = () => {
  mark.selectedGroup.remove()
  writeInfo()
}

window.onSwitchImg = () => {
  mark.beginDraw('https://publicai-dev.s3.ap-east-1.amazonaws.com/static/Mask/n03424325_3396.JPEG')
  writeInfo()
}

window.onSetDisDraw = () => {
  mark.setDisabled(!mark.disabled)
  writeInfo()
}

window.onSetlim = () => {
  mark.setLimit(mark.limitFrame === -1 ? 2 : -1)
  writeInfo()
}

window.onDel = () => {
  mark.removeSelectedGroup()
  writeInfo()
}
