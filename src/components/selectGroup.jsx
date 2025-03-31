import _ from 'lodash';
import React from 'react';

class SelectGroup extends React.Component {
    constructor(props) {
        super(props);
        // this.handleChange = this.handleChange.bind(this);
        this.state = {
            selectedId: null,
        };

        const { messenger } = this.props;

        messenger.onDataChanged.add((data) => {
            if (this.isThisDataMine(data)) {
                // console.log(`data: ${data.key} ${data.value} ${this.optionValues()}`);

                if (this.optionValues().includes(data.value)) {
                    this.selectButton(data.value, false);
                } else // NOT SUPPORTED VALUE
                {
                    this.selectFirstButton();
                }
            }
        });

        messenger.onLoaded.add((data) => {
            if (!messenger.hasData(this.props.gloveId, this.props.itemId, this.props.section, this.props.dataId)) {
                this.selectFirstButton();
            }
        });
    }

    isThisDataMine(data) {
        return data.gloveId === this.props.gloveId
            && data.itemId === this.props.itemId
            && data.section === this.props.section
            && this.props.dataId === data.key;
    }

    buttonSelected = (selectedId) => (ev) => {
        this.selectButton(selectedId, true);
    };

    selectButton(selectedId, updateData) {
        // console.log(`selectButton: ${selectedId}`);

        this.setState({ selectedId });
        if (updateData) this.props.messenger.updateData(this.props.gloveId, this.props.itemId, this.props.section, this.props.dataId, selectedId);
    }

    selectFirstButton() {
        this.selectButton(this.props.options[0].value, true);
    }

    render() {
        return (
            <div>
                <div>{this.props.subtitle}</div>

                {this.props.options.map((data) => <button className={data.value === this.state.selectedId ? 'selected' : ''} type="button" style={{ width: '25%', border: 'none' }} key={data.value} onClick={this.buttonSelected(data.value)}>{data.text}</button>)}
            </div>
        );
    }

    optionValues() {
        return _.map(this.props.options, 'value');
    }
}

export default SelectGroup;
