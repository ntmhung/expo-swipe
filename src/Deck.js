/**
 * Created by minhhung on 6/24/18.
 */
import React, {Component} from "react";
import {View, Animated, PanResponder, Dimensions, LayoutAnimation, UIManager} from "react-native";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 400;

class Deck extends Component {
    static defaultProps = {
        onSwipeRight: () => {
        },
        onSwipeLeft: () => {
        }
    };

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

        /*
         * Not necessary to assign position to state
         * index is the current viewed Card
         */
        this.state = {panResponder, position, index: 0};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.setState({index: 0});
        }
    }

    componentWillUpdate() {
        //Android only
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

        LayoutAnimation.spring();
    }

    forceSwipe(direction) {
        const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

        Animated.timing(this.state.position, {
            toValue: {x, y: 0},
            duration: SWIPE_OUT_DURATION
        }).start(() => this.onSwipeComplete(direction));
    }

    onSwipeComplete(direction) {
        const {onSwipeRight, onSwipeLeft, data} = this.props;
        const item = data[this.state.index];

        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
        this.state.position.setValue({x: 0, y: 0});
        this.setState({index: this.state.index + 1});
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
        if (this.state.index >= this.props.data.length) {
            return this.props.renderNoMoreCards();
        }

        return this.props.data.map((item, i) => {
            if (i < this.state.index) {
                return null;
            }

            if (i == this.state.index) {
                return (
                    <Animated.View
                        key={item.id}
                        style={[this.setCardGestureStyle(), styles.cardStyle]}
                        {...this.state.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                );
            }
            return (
                <Animated.View
                    key={item.id}
                    style={[styles.cardStyle, {top: 10 * (i - this.state.index)}]}
                >
                    {this.props.renderCard(item)}
                </Animated.View>
            );
        }).reverse();
    }

    render() {
        return (
            <View>
                {this.renderCards()}
            </View>
        )
    }
}

const styles = {
    cardStyle: {
        position: 'absolute',
        width: SCREEN_WIDTH
    }
};

export default Deck;