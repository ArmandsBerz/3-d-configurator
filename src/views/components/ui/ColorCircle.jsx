function ColorCircle(props) {
    return (
        <div
            className="ml-2.5 h-5 w-5 rounded-full"
            style={ { backgroundColor: props.color } }
        />
    );
}

export default ColorCircle;
