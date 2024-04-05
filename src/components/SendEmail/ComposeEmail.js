import React from 'react';
import '../Styling.css';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { to: '', subject: '', body: ''};
    this.handleToChange = this.handleToChange.bind(this);
    this.handleSubjectChange = this.handleSubjectChange.bind(this);
    this.handleBodyChange = this.handleBodyChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return (
      <form className='emailPage'>
        <div>
            <textarea className='email' placeholder='To..' onChange={this.handleToChange} required value={this.state.to} rows={1} />
            <textarea className='email' placeholder='Subject..' onChange={this.handleSubjectChange} required value={this.state.subject} rows={1} />
            <textarea className='email' placeholder='Email Body..' onChange={this.handleBodyChange} required value={this.state.body} rows={15} />
        </div>
        <input className='send' type="button" value="Send" onClick={this.handleSubmit} />
      </form>
    )
  }

  handleToChange(event) {
    this.setState({ to: event.target.value });
  }

  handleSubjectChange(event) {
    this.setState({ subject: event.target.value });
  }

  handleBodyChange(event) {
    this.setState({ body: event.target.value });
  }

  handleSubmit(event) {
    const templateId = 'template_o7us49f';
    this.sendFeedback(templateId, {to: this.state.to, subject: this.state.subject, body: this.state.body})
  }
  
  sendFeedback (templateId, variables) {
    window.emailjs.send('service_tf0ngi8', templateId, variables).then(res => {
      console.log('Email successfully sent!')
      alert('Email Sent Succesfully!')
      this.setState({ to: '', subject: '', body: '' });
    })
    // Handle errors here however you like, or use a React error boundary
    .catch(err => alert('Failed to send email: ' + this.state.to + " " + this.state.subject + " " + this.state.body))
  }
}