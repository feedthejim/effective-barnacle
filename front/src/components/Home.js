import React from 'react';

class Home extends React.Component {
  render() {
    return (
      <div className="panels-wrapper">
        <div className="panels">
          <div className="panel">
            {this.props.children}
          </div>
        </div>

        <p id="footer">© 2018
          <a href="http://github.com/feedthejim" rel="noopener noreferrer" target="_blank"> Jimmy Lai</a> &
          <a href="http://github.com/utay" rel="noopener noreferrer" target="_blank"> Yannick Utard</a>
        </p>
      </div>
    );
  }
}

export default Home;
