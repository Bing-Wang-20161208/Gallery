require('normalize.css/normalize.css');
require('styles/App.scss');
import React from 'react';
import ReactDOM from 'react-dom';

//获取图片相关的信息
let imageDatas = require('../data/imageDatas.json')
//利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas = ((imageDatasArr) => {
  for (let i = 0, j = imageDatasArr.length; i < j; i++) {
    let singleImageData = imageDatasArr[i];
    singleImageData.imageURL = require('../images/' + singleImageData.fileName);
    imageDatasArr[i] = singleImageData;
  }
  return imageDatasArr;
})(imageDatas);
//获取区间的随机值
let getRangeRandom = (low, high) => Math.floor(Math.random() * (high - low) + low);
//获取0~30°之间的任意正负值
let get30DegRandom = () => (Math.random() > 0.5 ? '' : '-') + Math.floor(Math.random() * 30);

class ImgFigure extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  /*
   *imgFigure的点击处理函数
   */
  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    //判断是否居中，在进行操作
    if (this.props.arrange.isCenter) {
      this.props.inverse();
    } else {
      this.props.center();
    }
  }
  render() {
    let styleObj = {};
    //如果props属性中指定了这张图片的位置，则使用
    if (this.props.arrange.pos) {
      styleObj = this.props.arrange.pos;
    }
    //如果图片的旋转角度存在且不为0，添加旋转角度
    if (this.props.arrange.rotate) {
      (['MozT', 'MsT', 'WebkitT', 't']).forEach(value => {
        styleObj[value + 'ransform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';
      });
    }
    if (this.props.arrange.isCenter) {
      styleObj.zIndex = 11;
    }
    let imgFigureClassName = 'img-figure';
    imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';
    return (
      <figure
        className={imgFigureClassName}
        style={styleObj}
        onClick={this.handleClick}
      >
        <img
          src={this.props.data.imageURL}
          alt={this.props.data.title}
        />
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick}>
            <p>{this.props.data.description}</p>
          </div>
        </figcaption>
      </figure>
    )
  }
}
class ControllerUnit extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    //如果点击的是当前正在居中的按钮，则翻转图片，否则将对应图片居中
    if (this.props.arrange.isCenter) {
      this.props.inverse();
    } else {
      this.props.center();
    }
  }
  render() {
    let controllerUnitClassName = 'controller-unit';
    //如果对应的是居中的图片，显示控制按钮的居中状态
    if (this.props.arrange.isCenter) {
      controllerUnitClassName += ' is-center';
      //如果同时对应的是翻转图片，显示控制按钮的翻转状态
      if (this.props.arrange.isInverse) {
        controllerUnitClassName += ' is-inverse';
      }
    }
    return (
      <span className={controllerUnitClassName} onClick={this.handleClick}></span>
    );
  }
}
class AppComponent extends React.Component {
  constructor(props) {
    super(props);
    this.Constant = {//存储图片排布的可取值范围
      centerPos: {//中心点
        left: 0,
        top: 0
      },
      hPosRange: {//左右
        leftSecX: [0, 0],
        rightSecX: [0, 0],
        y: [0, 0]
      },
      vPosRange: {//上
        x: [0, 0],
        topY: [0, 0]
      }
    };
    this.state = {
      imgsArrangeArr: [//每一个数组元素都是一个状态对象
        /*{
          pos: {//位置信息
            left: '0',
            right: '0'
          },
          rotate: 0, //旋转角度
          isInverse: false, //图片正反面，true为反
          isCenter: false //图片是否居中，默认不居中
        }*/
      ]
    };
  }
  /*
   *翻转图片
   *@param index 输入当前被执行inver操作的图片对应的图片信息数组的index值
   *@return {Funcrion} 这是一个闭包函数，其内retuen一个真正待被执行的函数
   */
   inverse(index) {
     return () => {
       let imgsArrangeArr = this.state.imgsArrangeArr;
       imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
       this.setState({
         imgsArrangeArr: imgsArrangeArr
       });
     }
   }
  /*
   *利用rearrange函数，居中对应index的图片
   *@param index， 需要被居中的图片对应的图片信息数组的index值
   *@return {Function}
   */
   center(index) {
     return () => this.rearrange(index);
   }
  rearrange(centerIndex) {//重新布局所有的图片,参数指定居中的图片
    let imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangeLeftSecX = Constant.hPosRange.leftSecX,
        hPosRangeRightSecX = Constant.hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,
        imgsArrangeTopArr = [],//上侧区域图片的状态信息0,1个
        topImgNum = Math.floor(Math.random() * 2),//一个或零个
        topImgSpliceIndex = 0,//标记布局在上侧区域的这张图片是从数组对象的哪个位置拿出来的
        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);
        //首先居中centerIndex的图片,居中的centerIndex的图片不需要旋转
        imgsArrangeCenterArr[0] = {
          pos: centerPos,
          rotate: 0,
          isCenter: true
        };
        //取出要布局上侧的图片的状态信息
        topImgSpliceIndex = Math.floor(Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);
        //布局位于上侧的图片
        imgsArrangeTopArr.forEach((value, i) => {
          imgsArrangeTopArr[i] = {
              pos: {
                top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
              },
              rotate: get30DegRandom(),
              isCenter: false
            }
        });
        //布局位于左右两侧的图片
        for (var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
          let hPosRangeLOrR = 0;
          //前半部分布局左边，后半部份布局右边
          if (i < k) {
            hPosRangeLOrR = hPosRangeLeftSecX;
          } else {
            hPosRangeLOrR = hPosRangeRightSecX;
          }
          imgsArrangeArr[i] = {
            pos: {
              top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
              left: getRangeRandom(hPosRangeLOrR[0], hPosRangeLOrR[1])
            },
            rotate: get30DegRandom(),
            isCenter: false
          }
        }
        //重新合并
        if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
          imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }
        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);
        //变更state，重新渲染
        this.setState({
          imgsArrangeArr: imgsArrangeArr
        });
  }
  componentDidMount() {//组件加载以后，为每张图片计算其范围
    //首先拿到舞台的大小
    let stageDom = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDom.scrollWidth,
        stageH = stageDom.scrollHeight,
        halfStageW = Math.floor(stageW / 2),
        halfStageH = Math.floor(stageH / 2);
        /*
         *scrollWidth:对象的实际内容宽度，不包含边线、滚动条等，会随对象中内容超过可视区域而变大
         *clientWidth:对象的可视内容宽度，不包含边线、滚动条等，会随对象显示大小变化改变而改变
         *offsetWidth:对象的整体的实际宽度，包含边线、滚动条等，会随对象显示大小变化而改变
         */
      //拿到一个imageFigure的大小
      let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
          imgW = imgFigureDOM.scrollWidth,
          imgH = imgFigureDOM.scrollHeight,
          halfImgW = Math.floor(imgW / 2),
          halfImgH = Math.floor(imgH / 2);
          //计算中心图片的位置
        this.Constant.centerPos.left=halfStageW-halfImgW;
        this.Constant.centerPos.top=halfStageH-halfImgH;

        //计算左右区域的位置
        this.Constant.hPosRange.leftSecX[0] = -halfImgW;
        this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
        this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
        this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
        this.Constant.hPosRange.y[0] = -halfImgH;
        this.Constant.hPosRange.y[1] = halfStageH;

        //计算上区域的位置
        this.Constant.vPosRange.x[0] = halfStageW - halfImgW;
        this.Constant.vPosRange.x[1] = halfStageW;
        this.Constant.vPosRange.topY[0]= -halfImgH;
        this.Constant.vPosRange.topY[1]=halfStageH - halfImgH * 3;
      //调用重新排序
      this.rearrange(0);
  }
  render() {
    let controllerUnits = [],
        imgFigures = [];
    imageDatas.forEach((value, i) => {
      if (!this.state.imgsArrangeArr[i]) {//判断是否有初始定位
        this.state.imgsArrangeArr[i] = {
          pos: {
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        };
      }
      imgFigures.push(
        <ImgFigure
          key={i}
          data={value}
          ref={'imgFigure' + i}
          arrange={this.state.imgsArrangeArr[i]}
          inverse={this.inverse(i)}
          center={this.center(i)}
        />
      );
      controllerUnits.push(
        <ControllerUnit
          key={i}
          arrange={this.state.imgsArrangeArr[i]}
          inverse={this.inverse(i)}
          center={this.center(i)}
        />
      );
    })
    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
