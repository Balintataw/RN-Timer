import React from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    StatusBar, 
    TouchableOpacity, 
    Dimensions, 
    Picker, 
    Vibration,
    Platform } from 'react-native';
import { Audio } from 'expo';

const screen = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#07121B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        marginTop: 30,
        borderWidth: 10,
        borderColor: "#89AAFF",
        width: screen.width / 2,
        height: screen.width / 2,
        borderRadius: screen.width / 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 45,
        color: "#89AAFF"
    },
    buttonStop: {
        borderColor: "#FF851B"
    },
    buttonTextStop: {
        color: "#FF851B"
    },
    timerText: {
        color: "#FFF",
        fontSize: 90
    },
    pickerContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    picker: {
        width: 50,
        ...Platform.select({
            android: {
                color: "#fff",
                backgroundColor: "#07121B",
                marginLeft: 10
            }
        })
    },
    pickerItem: {
        color: "#FFF",
        fontSize: 20
    }
});

const formatNumber = number => `0${number}`.slice(-2);

const getRemaining = time => {
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return { minutes: formatNumber(minutes), seconds: formatNumber(seconds) };
};

const createArray = length => {
    const arr = [];
    let i = 0;
    while( i < length) {
        arr.push(i.toString())
        i++;
    }
    return arr;
}

const AVAILABLE_MINUTES = createArray(10);
const AVAILABLE_SECONDS = createArray(60);

export default class App extends React.Component {
    state = {
        remainingSeconds: 20,
        interval: null,
        isRunning: false,
        selectedMinutes: '0',
        selectedSeconds: '0',
    };

    componentDidUpdate = async (prevProp, prevState) => {
        if(this.state.remainingSeconds === 0 && prevState.remainingSeconds !== 0) {
            const soundObject = new Audio.Sound();
            try {
                await soundObject.loadAsync(require('../assets/ding.mp3'));
                await soundObject.playAsync();
                Vibration.vibrate();
                // Your sound is playing!
            } catch (error) {
                // An error occurred!
            } finally {
                this.stop();
            }
        }
    }
    componentWillUnmount = () => {
        if(this.interval) {
            clearInterval(this.interval);
        }
    }

    start = () => {
        this.setState(state => ({
            remainingSeconds: parseInt(state.selectedMinutes) * 60 + parseInt(state.selectedSeconds),
            isRunning: true
        }));

        this.interval = setInterval(() => {
            this.setState(state => ({
                remainingSeconds: state.remainingSeconds - 1
            }));
        }, 1000)
    }

    stop = () => {
        clearInterval(this.interval);
        this.interval = null
        this.setState({
            remainingSeconds: 0, 
            isRunning: false
        })
    }

    renderPickers = () => {
        return (
            <View style={styles.pickerContainer}>
                <Picker
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                    selectedValue={this.state.selectedMinutes}
                    onValueChange={itemValue => {
                        this.setState({ selectedMinutes: itemValue })
                    }}
                    mode="dropdown"
                >
                    {AVAILABLE_MINUTES.map(value => (
                        <Picker.Item key={value} label={value} value={value} />
                    ))} 
                </Picker>
                <Text style={styles.pickerItem}>Minutes</Text>
                <Picker
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                    selectedValue={this.state.selectedSeconds} 
                    onValueChange={itemValue => {
                        this.setState({ selectedSeconds: itemValue })
                    }}
                    mode="dropdown"
                >
                    {AVAILABLE_SECONDS.map(value => (
                        <Picker.Item key={value} label={value} value={value} />
                    ))} 
                </Picker>
                <Text style={styles.pickerItem}>Seconds</Text>
            </View>
        )
    }
    render() {
        const { minutes, seconds } = getRemaining(this.state.remainingSeconds);

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                {this.state.isRunning ? (
                    <Text style={styles.timerText}>{`${minutes}:${seconds}`}</Text>
                ) : (
                    this.renderPickers()
                )}

                {this.state.isRunning ? (
                    <TouchableOpacity onPress={this.stop} style={[styles.button, styles.buttonStop]}>
                        <Text style={[styles.buttonText, styles.buttonTextStop]}>Stop</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={this.start} style={styles.button}>
                        <Text style={styles.buttonText}>Start</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }
}

