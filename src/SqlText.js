import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
import '../node_modules/codemirror/mode/sql/sql';

class SQLText extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sqlText: props.query,
      handleUserQuery : this.props.handleUserQuery,
      saveUserQueryForEvaluator: props.saveUserQueryForEvaluator,
      inlinelDb: props.inlineDb
    }
    this.runQueryImmediately = false;
    this.updateSqlText = this.updateSqlText.bind(this);
  }

  componentWillMount() {
    this.state.saveUserQueryForEvaluator(this.state.sqlText);
  }

  updateSqlText (currentQuery) {
    //console.log('updateSqlText with currentQuery:', currentQuery);
    this.setState( {sqlText: currentQuery} );
    if (this.runQueryImmediately) {
      //console.log('runNow:', currentQuery);
      this.state.handleUserQuery(currentQuery);
      this.runQueryImmediately = false;
    } else {
      this.state.saveUserQueryForEvaluator(currentQuery);
    }
  }

  render() {
    var callUpdate = function(currentQuery) { this.runQueryImmediately = true; this.updateSqlText(currentQuery); };
    callUpdate = callUpdate.bind(this);
    var options = {
      lineNumbers: true,
      extraKeys: {
        'Ctrl-Enter': function(cm) { callUpdate(cm.getValue()); },
        'Alt-Enter' : function(cm) { callUpdate(cm.getValue()); },
        'Cmd-Enter' : function(cm) { callUpdate(cm.getValue()); }
      },
      mode: 'sql'
    };
    return <CodeMirror value={this.state.sqlText} onChange={this.updateSqlText} options={options} />
  }
}

export default SQLText;
