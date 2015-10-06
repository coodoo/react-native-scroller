'use strict';

import React, { Component, PropTypes } from 'react-native';
import NavPage from './NavPageJS';
import StyleSheetRegistry from 'StyleSheetRegistry';
import {UIManager} from 'NativeModules';

const {
	StyleSheet,
	Text,
	View,
	Image,
	ListView,
	TouchableHighlight,
	TouchableOpacity,
	Navigator,
	NavigatorIOS,
	ScrollView,
	PanResponder,
	Animated,
	Easing,
} = React;

export default class Scroller extends Component {

	state = {
		dual: new Animated.ValueXY( {x: 0, y: 0} ),
	}

	hasElasticEdges = true
	elasticity = 0.7
	throwElasticity = 0.5

	constructor( a, b ) {
		super( a, b );
	}

	/*
		量出幾個基本數據備用

		content
			width
			height

		scroller
			width
			height
			scrollerXBound
			scrollerYBound
	 */
	componentDidMount() {

		setTimeout( () => {

			var childrenNode = React.findNodeHandle( this.props.children._owner );
			var contentPaneNode = React.findNodeHandle( this.refs.contentPane );
			var scrollNode = React.findNodeHandle( this );

			// 既然無法自動量，只好讀 style 內的 width, height，反正用戶一定很設定
			/*var s = StyleSheetRegistry.getStyleByID( this.props.children.props.style );
			console.log( 'style: ', s );*/

			// 直接量 contentPane 下面小孩，才能得出正確的 w, h
			UIManager.measureViewsInRect(
									{left:0, top:0, width:10, height:10},
									contentPaneNode,
									err => console.log( err ),
									arrObj => {
										// console.log( 'inRect: ', arrObj[0] );
										this.$contentWidth = arrObj[0].width;
										this.$contentHeight = arrObj[0].height;
									} );

			// 計算 Scroller 本身的 xywh
			UIManager.measureLayout( scrollNode, scrollNode,
									err => console.log( err ),
									( x, y, width, height ) => {
										this.$scrollerWidth = width;
										this.$scrollerHeight = height;
										this.$scrollerXBound = width - this.$contentWidth;
										this.$scrollerYBound = height - this.$contentHeight;
										// console.log( 'measureLayout: ', x, y, width, height );
									} );

		} )

		this.$outboundX = this.$outboundY = false;
	}

	componentDidUpdate() {}

	componentWillMount() {

		this.panGesture = PanResponder.create( {
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,

			onPanResponderGrant: ( e, gestureState ) => {
				// console.log( 'granted: ', JSON.parse(JSON.stringify(gestureState)) );
				// console.log( 'granted >總移動: ', gestureState.dx, '\t>最近移動: ', gestureState.moveX );
				this.$lastPt = {x: gestureState.x0, y: gestureState.y0 };
			},

			onPanResponderMove: ( e, gestureState ) => {
				// var info = JSON.parse( JSON.stringify( gestureState ) );
				// console.log( 'move: ', info );

				let mx = gestureState.moveX - this.$lastPt.x;
				let my = gestureState.moveY - this.$lastPt.y;

				if ( this.state.dual.x._value > 0 ) {
					// console.log( ' x 出界了' );
					mx = mx * ( 1 - this.elasticity );
					this.$outboundX = true;
				}

				if ( this.state.dual.x._value < this.$scrollerXBound ) {
					// console.log( ' x 向左出界: ', JSON.parse(JSON.stringify(gestureState)) );
					if ( gestureState.vx < 0 ) {
						mx = mx * ( 1 - this.elasticity );
					}
					this.$outboundX = true;
				}

				if ( this.state.dual.y._value > 0 ) {
					// console.log( '\ny 出界了: ', my );
					my = my * ( 1 - this.elasticity );
					this.$outboundY = true;
				}

				if ( this.state.dual.y._value < this.$scrollerYBound ) {
					// console.log( ' y 向上出界: ', JSON.parse(JSON.stringify(gestureState)) );
					if ( gestureState.vy < 0 ) {
						my = my * ( 1 - this.elasticity );
					}
					this.$outboundY = true;
				}

				// console.log( 'mx: ', mx, ' my:', my );
				// if( my > 40 ) my = 10;
				// if( my < -40 ) my = -10;
				// console.log( '\t修完: ', my );

				this.state.dual.setValue( {
					x: this.state.dual.x._value + mx,
					y: this.state.dual.y._value + my,
				} );

				// console.log( '設定 xy: ', this.state );

				this.$lastPt = {x: gestureState.moveX, y: gestureState.moveY };
			},

			onPanResponderRelease: ( e, gestureState ) => {
				// console.log( 'release: ', JSON.parse(JSON.stringify(gestureState)) );

				// 太小量的 v 代表沒 throw 的意思
				if ( this.$outboundX || this.$outboundY ) {

					this.checkBounds( gestureState );

				} else if ( Math.abs( gestureState.vx ) > 0.03 || Math.abs( gestureState.vy ) > 0.03 ) {

					// console.log( '滑' );
					// console.log( 'vx: ', gestureState.vx, ' vy: ', gestureState.vy );

					// cap the velocity
					let vx = Math.max( -0.5, Math.min( 0.5, gestureState.vx));
					let vy = Math.max( -0.5, Math.min( 0.5, gestureState.vy));

					Animated.decay(
						this.state.dual,
						{
							toValue: {x: 44, y: 44},	// 是我想移動的量，不是 destination point
							velocity: {x: vx, y: vy},
							deceleration: 0.996,
						}
					).start( () => this.checkBounds( gestureState ) );

				}

				this.$outboundX = this.$outboundY = false;
			},
		} );
	}

	checkBounds( gestureState ) {

		// console.log( 'check bounds > 此時 x/y: ', this.state.dual.x._value, this.state.dual.y._value );
		// console.log( '\tbound: ', this.$scrollerXBound, this.$scrollerYBound );

		let obj = { x: this.state.dual.x._value, y: this.state.dual.y._value };

		if ( this.state.dual.x._value > 0 ) obj.x = 0;

		if ( this.state.dual.x._value < this.$scrollerXBound ) obj.x = this.$scrollerXBound;

		if ( this.state.dual.y._value > 0 ) obj.y = 0;

		if ( this.state.dual.y._value < this.$scrollerYBound ) obj.y = this.$scrollerYBound;

		Animated.timing(
			this.state.dual,
			{
				toValue: {x: obj.x, y: obj.y},
				duration: 200,
				easing: Easing.out( Easing.ease )
			}
		).start();

	}

	render() {

		return (

			<View style={styles.viewport} {...this.panGesture.panHandlers}>
				<Animated.View style={[styles.contentPane, this.state.dual.getLayout()]} ref='contentPane'>
					{this.props.children}
				</Animated.View>
			</View>
		)
	}

}

const styles = StyleSheet.create( {

	viewport: {

		flex: 0,
		width: 200,
		height: 200,

		left: 40,
		top: 40,

		backgroundColor:'yellow',
		borderWidth: 1,
		borderColor: 'red',

		overflow: 'hidden',
	},

	contentPane: {
		left: 0,
		top: 0,
	},

} );
