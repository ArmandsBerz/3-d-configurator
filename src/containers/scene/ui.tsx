import React from 'react';
import SelectGroup from '../../components/selectGroup';
import SceneBabylon, { colorOptions } from '../../containers/scene/SceneBabylon';

// class UI extends React.Component {
const UI = (props) => {
    const isLoaded = false;

    // componentDidMount() {
    //     this.isLoaded = true;
    //     this.props.onLoaded();
    // }

    const renderGlove = () => (
        <div>
            <div>{props.glove.id}</div>
            {
                renderGloveObject(props.glove.id, props.glove.gloveObject)
            }
        </div>
    );

    const renderGloveObject = (gloveId, gloveObject) => (
        <div>
            <div>{gloveObject.id}</div>
            {
                renderSection(gloveId, 'zones', gloveObject)
            }
        </div>
    );

    function renderSection(gloveId, section, gloveObject) {
        const gloveZones = gloveObject.zones.zones;

        return (
            <div>
                <div>{section}</div>
                <br />
                {
                    gloveZones.map((element) => <SelectGroup
                        gloveId={gloveId}
                        itemId={gloveObject.id}
                        section={section}
                        messenger={props.messenger}
                        key={element}
                        subtitle={element}
                        dataId={element}
                        options={colorOptions}
                    />)
                }
            </div>
        );
    }

    return (
        <>
            { renderGlove() }
        </>
    );
};
