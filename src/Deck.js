/**
 * Created by minhhung on 6/24/18.
 */
import React, {Component} from "react";
import {View, Animated, PanResponder, Dimensions} from "react-native";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 400;

class Deck extends Component {
    constructor(props) {
        super(props);

        const position = new Animated.ValueXY();

        const panResponder = PanResponder.create({
            /**
             * Execute anytime user taps on the screen.
             * If return TRUE, the whole instance of PanResponder will be responsible for pressing on the screen
             * @return Boolean
             */
            onStartShouldSetPanResponder: () => true,

            /**
             * Execute anytime user drag finger around the screen.
             */
            onPanResponderMove: (event, gesture) => {
                position.setValue({x: gesture.dx, y: gesture.dy})
            },

            /**
             * Execute anytime user move finger out of screen.
             */
            onPanResponderRelease: (event, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD) {
                    this.forceSwipe('right');
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    this.forceSwipe('left');
                } else {
                    this.resetPosition();
                }
            }

        });

        //not necessary to do this
        this.state = {panResponder, position};
    }

    forceSwipe(direction) {
        const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

        Animated.timing(this.state.position, {
            toValue: {x, y: 0},
            duration: SWIPE_OUT_DURATION
        }).start(() => this.onSwipeComplete(direction));
    }

    onSwipeComplete(direction) {
        const {onSwipeRight, onSwipeLeft} = this.props;
        direction === 'right' ? onSwipeRight() : onSwipeLeft();
    }

    resetPosition() {
        Animated.spring(this.state.position, {
            toValue: {x: 0, y: 0}
        }).start();
    }

    setCardGestureStyle() {
        const {position} = this.state;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
            outputRange: ['-120deg', '0deg', '120deg']
        });

        return {
            ...position.getLayout(),
            transform: [{rotate}]
        }
    }

    renderCards() {
        return this.props.data.map((item, index) => {
            if (index == 0) {
                return (
                    <Animated.View
                        key={item.id}
                        style={this.setCardGestureStyle()}
                        {...this.state.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                );
            }
            return this.props.renderCard(item);
        })
    }

    render() {
        return (
            <View>
                {this.renderCards()}
            </View>
        )
    }
}

export default Deck;