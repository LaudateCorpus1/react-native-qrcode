'use strict'

var React = require('react')
var PropTypes = require('prop-types')
var createReactClass = require('create-react-class')
var Canvas = require('./Canvas.js')

var QRCodeLib = require('qrcode')

var { View } = require('react-native')

function renderCanvas(canvas) {
    var ctx = canvas.getContext('2d')
    var size = this.size
    var fgColor = this.fgColor
    var bgColor = this.bgColor
    var boxSize = size * 3.8
    canvas.width = boxSize
    canvas.height = boxSize
    canvas.style.left = (window.innerWidth - boxSize) / 2 + 'px'
    if (window.innerHeight > boxSize) canvas.style.top = (window.innerHeight - boxSize) / 2 + 'px'
    ctx.fillRect(0, 0, boxSize, boxSize)
    var cells = this.cells
    var cellWidth = boxSize / cells.length
    var cellHeight = boxSize / cells.length
    var nRoundedWidth = Math.round(cellWidth)
    var nRoundedHeight = Math.round(cellHeight)
    cells.forEach(function(row, rowIndex) {
        row.forEach(function(column, columnIndex) {
            var nLeft = columnIndex * cellWidth
            var nTop = rowIndex * cellHeight
            ctx.strokeStyle = column === 0 ? bgColor : fgColor
            ctx.fillStyle = column === 0 ? bgColor : fgColor
            ctx.lineWidth = 1
            ctx.fillRect(nLeft, nTop, cellWidth, cellHeight)
            ctx.strokeRect(
                Math.floor(nLeft) + 0.5,
                Math.floor(nTop) + 0.5,
                nRoundedWidth,
                nRoundedHeight
            )
            ctx.strokeRect(
                Math.ceil(nLeft) - 0.5,
                Math.ceil(nTop) - 0.5,
                nRoundedWidth,
                nRoundedHeight
            )
        })
    })
}

var QRCode = createReactClass({
    PropTypes: {
        value: PropTypes.string,
        size: PropTypes.number,
        bgColor: PropTypes.string,
        fgColor: PropTypes.string,
        onLoad: PropTypes.func,
        onLoadEnd: PropTypes.func
    },

    getDefaultProps: function() {
        return {
            value: 'https://github.com/cssivision',
            fgColor: 'white',
            bgColor: 'black',
            size: 128,
            onLoad: () => {
            },
            onLoadEnd: () => {
            }
        }
    },

    utf16to8: function(str) {
        var out, i, len, c
        out = ''
        len = str.length
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i)
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i)
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F))
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F))
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F))
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F))
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F))
            }
        }
        return out
    },

    matrix: function(value, errorCorrectionLevel) {
        const arr = Array.prototype.slice.call(QRCodeLib.create(value, { errorCorrectionLevel }).modules.data, 0)
        const sqrt = Math.sqrt(arr.length)
        return arr.reduce((rows, key, index) => (index % sqrt === 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) && rows, [])
    },

    render: function() {
        var size = this.props.size
        var value = this.utf16to8(this.props.value)
        return (
            <View>
                <Canvas
                    context={{
                        size: size,
                        value: this.props.value,
                        bgColor: this.props.bgColor,
                        fgColor: this.props.fgColor,
                        cells: this.matrix(value)
                    }}
                    render={renderCanvas}
                    onLoad={this.props.onLoad}
                    onLoadEnd={this.props.onLoadEnd}
                    style={{ height: size, width: size }}
                />
            </View>
        )
    }
})


module.exports = QRCode
