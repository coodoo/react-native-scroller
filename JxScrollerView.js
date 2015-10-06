'use strict';

/*
*/
import React, { Component, PropTypes } from 'react-native';
import NavPage from './NavPageJS';
import cssVar from 'cssVar';
import JxScroller from './JxScroller';
import JxScrollerIOS from './JxScrollerIOS';

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
} = React;


export default class JxScrollView extends Component {

	constructor(a, b){
		super(a, b);
	}

	componentDidMount() {}

	componentWillUnmount() {}

	render() {

		return (

			<View>
				<JxScroller>
					<Image source={{uri: 'https://facebook.github.io/react/img/logo_og.png'}}
						     style={styles.image} />
				</JxScroller>

				<View style={{width: 1, height:20, borderWidth: 1}} />

				<JxScrollerIOS />
			</View>

		)

	}

}

const styles = StyleSheet.create( {

	container: {
		flex: 0,
		height:200,
		backgroundColor:'yellow',
		width: 200,
		borderWidth: 2,
		borderTopColor: 'red',
		left: 20,
		top: 40,
		backfaceVisibility: 'hidden',
	},

	image: {
		paddingTop: 0,
		width: 400,
		height: 400,
	},

	contentStyle: {
		backgroundColor:'#eeffaa',
	},

	row1: {
		backgroundColor:'#ff00ff',
	},

	row2: {
		backgroundColor:'#00aaff',
	},

	row: {
		height: 44,
		borderWidth: 1,
		width: 80,
	},

	title: {
		fontSize: 20,
		marginBottom: 8,
		textAlign: 'left',
		paddingLeft: 10,
	},

	wrapperStyle: {
		backgroundColor: '#ff0000',
	},

	navBar: {
		backgroundColor: 'pink',
		opacity: 1,
		borderWidth: 0,
	},

	navBarText: {
		fontSize: 16,
		marginVertical: 10,
	},

	navBarTitleText: {
		// color: cssVar('fbui-bluegray-60'),
		color: '#373e4d',
		fontWeight: '500',
		marginVertical: 9,
	},

	navBarLeftButton: {
		paddingLeft: 10,
	},

	navBarRightButton: {
		paddingRight: 10,
	},

	navBarButtonText: {
		color: cssVar('fbui-accent-blue'),
	},

	scene: {
		flex: 1,
		paddingTop: 20,
		backgroundColor: '#EAEAEA',
	},

});
