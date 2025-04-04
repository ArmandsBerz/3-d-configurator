// /* eslint-disable import/prefer-default-export */
// /* eslint-disable max-classes-per-file */
// import React from 'react';

// function onlyChild(children) {
//     return Array.isArray(children) ? children[0] : children;
// }

// export function combineContext(contexts) {
//     class Provider extends React.Component {
//         render() {
//             const init = this.props.children;
//             return Object.keys(contexts).reduce((acc, contextName) => {
//                 const TheContext = contexts[contextName];
//                 return <TheContext.Provider value={this.props.value[contextName]}>{acc}</TheContext.Provider>;
//             }, init);
//         }
//     }

//     class Consumer extends React.Component {
//         render() {
//             const init = (value) => onlyChild(this.props.children)(value);
//             const renderer = Object.keys(contexts).reduce((acc, contextName) => {
//                 const TheContext = contexts[contextName];
//                 return (value) => (
//                     <TheContext.Consumer>
//                         {(contextValue) => acc({
//                             ...value,
//                             [contextName]: contextValue,
//                         })}
//                     </TheContext.Consumer>
//                 );
//             }, init);
//             return renderer({});
//         }
//     }

//     return {
//         Consumer,
//         Provider,
//     };
// }

