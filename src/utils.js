export const changeCssVideos = (main, elms) => {
  let widthMain = main.offsetWidth
  let minWidth = '30%'
  if ((widthMain * 30) / 100 < 300) {
    minWidth = '300px'
  }
  let minHeight = '40%'

  let height = String(100 / elms) + '%'
  let width = ''
  if (elms === 0 || elms === 1) {
    width = '100%'
    height = '100%'
  } else if (elms === 2) {
    width = '45%'
    height = '100%'
  } else if (elms === 3 || elms === 4) {
    width = '35%'
    height = '50%'
  } else {
    width = String(100 / elms) + '%'
  }

  let videos = main.querySelectorAll('video')
  for (let a = 0; a < videos.length; ++a) {
    videos[a].style.minWidth = minWidth
    videos[a].style.minHeight = minHeight
    videos[a].style.setProperty('width', width)
    videos[a].style.setProperty('height', height)
  }

  return { minWidth, minHeight, width, height }
}