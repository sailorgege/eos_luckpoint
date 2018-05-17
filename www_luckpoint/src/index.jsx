import React from 'react'
import ReactDOM from 'react-dom'
import EOSJS from 'eosjs'

let contract_name = 'luckpoint.co'
let account_name = 'banker'

const EOSJS_CONFIG = {
  contractName: contract_name,    // 合约名字
  contractSender: account_name,   // 执行合约的账户 (需要与私钥对应)
  clientConfig: {
    keyProvider: ['5JcziTgwUhQgKyvmvc4ygEPGonQPVrBYNTwezAg5UuJ7djyVDWQ'], // 账号对应的私钥
    httpEndpoint: 'http://127.0.0.1:8888' // EOS节点程序的http终端
  }
}

class LuckPoint extends React.Component {
  constructor(props) {
    super(props)

    this._initGameData = this._initGameData.bind(this)

    this.gameprops = {
      gameIndex: -1,
      gameDataList: [],
      loading_text: '正在读取数据...',
    }

    this.state = {
      gameStatus: false,
      winner: 0,
    }
  }

  componentDidMount() {
    this._initGameData()
  }

  _initGameData() {
    console.log('_initGameData::......')

    this._updateGameData()
  }

  // cleos get table luckpoint.co luckpoint.co game
  _updateGameData() {
    console.log('_updateGameData::......')

    this._showLoading(true, '正在读取游戏数据... ...')

    this.gameprops.gameIndex = -1
    this.gameprops.gameDataList = []

    // 读取游戏数据
    let eosjs = EOSJS.Localnet(EOSJS_CONFIG.clientConfig)
    eosjs.contract(contract_name)
      .then((contract) => {
        console.log('_updateGameData::' + contract_name + '合约加载成功！')

        eosjs.getTableRows({"scope":contract_name, "code":contract_name, "table":"game", "json": true})
          .then(result => {
            console.log('_updateGameData::读取游戏列表成功！')

            let rows = result.rows
            let len = rows.length
            for(let i = 0; i < len; i ++){
              var id = result.rows[i].id
              var winner = result.rows[i].winner
              var player1 = result.rows[i].player1
              var player2 = result.rows[i].player2
              var createtime = result.rows[i].createtime
              var owner = result.rows[i].owner

            	// console.log('_updateGameData::rows[' + i + '].id:' + id)
            	// console.log('_updateGameData::rows[' + i + '].winner:' + winner)
            	// console.log('_updateGameData::rows[' + i + '].player1:' + player1)
              // console.log('_updateGameData::rows[' + i + '].player2:' + player2)
              // console.log('_updateGameData::rows[' + i + '].createtime:' + createtime)
              // console.log('_updateGameData::rows[' + i + '].owner:' + owner)

              this.gameprops.gameDataList.push({
                id: id,
                winner: winner,
                player1: player1,
                player2: player2,
                createtime: createtime,
                owner: owner
              })
            }

            if(len > 0){
              this.gameprops.gameIndex = len - 1
            }else{
              this.gameprops.gameIndex = -1
            }

            this._refreshUIView()
        	})
         .catch((err) => {
           console.log('_updateGameData::读取游戏列表失败！')
           this.gameprops.gameIndex = -1
           this._refreshUIView()
         })
      })
  }

  _createGame() {
    console.log('_createGame::创建游戏 ...')

    this._showLoading(true, '正在创建游戏... ...')

    let _sender = account_name
    let eosjs = EOSJS.Localnet(EOSJS_CONFIG.clientConfig)
    eosjs.contract(EOSJS_CONFIG.contractName)
      .then((contract) => {
        console.log('_createGame::加载合约成功！')

        contract.creategame(_sender, { authorization: [_sender] })
          .then((res) => {
            console.log('_createGame::游戏创建成功！')

            this._updateGameData()
          })
          .catch((err) => {
            console.log('_createGame::游戏创建失败！')
          })
      })
  }

  _playerOpenCard(game_id, play_id) {
    console.log('_playerOpenCard::游戏ID:' + game_id + '，玩家' + play_id + '开牌 ...')

    this._showLoading(true, '玩家' + play_id + '正在开牌 ...')

    let _sender = account_name
    let eosjs = EOSJS.Localnet(EOSJS_CONFIG.clientConfig)
    eosjs.contract(EOSJS_CONFIG.contractName)
      .then((contract) => {
        console.log('_playerOpenCard::加载合约成功！')

        contract.opencard(game_id, play_id, { authorization: [_sender] })
          .then((res) => {
            console.log('_playerOpenCard::开牌成功！')

            this._updateGameData()
          })
          .catch((err) => {
            console.log('_playerOpenCard::开牌失败！')
          })
      })
  }

  render() {
    console.log('render ...')
    return (this._renderMain())
  }

  _renderMain() {
    return (
      <div style={ style.container }>
        {this._renderHeader()}
        {this._renderBody()}
        {this._renderLoading()}
      </div>
    )
  }

  _renderLoading() {

    if(this.state.loading){
      return (
        <div style={ style.loadingBox }>
          <div style={ style.loadingImage }>
            <img style={ style.loadingImageImg } src="images/prompticon.png" width='100' height='100'></img>
          </div>
          <div style={ style.loadingText }>
            <span style={ style.loadingTextValue }>{this.gameprops.loading_text}</span>
          </div>
        </div>
      )
    }else{
      return null;
    }
  }

  _renderHeader() {
    return (
      <div style={ style.headerBox }>
        <div style={ style.headerLogoBox }>
          <img style={ style.headerLogo } src="images/logo.png" width='180' height='200'></img>
        </div>
        <div style={ style.headerRightBox }>
          <button style={ style.headerRightBtn } onClick={this._clickBtnCreateGame.bind(this)}>创建游戏</button>
        </div>
      </div>
    )
  }

  _renderBody() {
    return (
      <div style={ style.bodyBox }>
        {this._renderGameBox()}
      </div>
    )
  }

  _renderGameBox() {
    if(this.gameprops.gameIndex >= 0){
      let game = this.gameprops.gameDataList[this.gameprops.gameIndex]
      return (
        <div style={ style.gameBox }>
          {this._renderGameBoxPlayer(1, game)}
          {this._renderGameBoxScreen(game)}
          {this._renderGameBoxPlayer(2, game)}
        </div>
      )
    }else{
      return (
        <div style={ style.bodyBox }>
          <span style={ style.emptyGamePrompt }>还没有游戏，去创建一个新游戏吧~！</span>
        </div>
      )
    }
  }

  _renderGameBoxPlayer(play_id, game) {
    var play_name = 'Alice'
    var play_img = 'images/player1s.png'
    if(play_id == 2){
      play_name = 'Bob'
      play_img = 'images/player2s.png'
    }
    return (
      <div style={ style.gameBoxPlayer }>
        {this._renderPlayerName(play_name)}
        {this._renderPlayerImage(play_img)}
        {this._renderPlayerButton(play_id, game)}
      </div>
    )
  }

  _renderPlayerName(play_name) {
    return (
      <div style={ style.gamePlayerName }>
        <span style={ style.gamePlayerNameValue }>{play_name}</span>
      </div>
    )
  }

  _renderPlayerImage(play_img) {
    return (
      <div style={ style.gamePlayerImage }>
        <img style={ style.gamePlayerImageValue } src={play_img}></img>
      </div>
    )
  }

  _renderPlayerButton(play_id, game) {
    console.log('_renderPlayerButton::play_id=' + play_id)
    console.log(game)

    let title = '开牌'
    if(play_id == 1 && game.player1 == 1){
      title = '已开牌'
    }else if(play_id == 2 && game.player2 == 1){
      title = '已开牌'
    }
    return (
      <div style={ style.gamePlayerButton }>
        <button style={ style.playButton } onClick={this._clickPlayerBtn.bind(this, play_id)}>{title}</button>
      </div>
    )
  }

  _renderGameBoxScreen(game) {
    var stateText = '双方可以开牌'
    if(game.winner == 1){
      stateText = 'alice胜出！'
    }else if(game.winner == 2){
      stateText = 'bob胜出！'
    }

    return (
      <div style={ style.gameBoxScreen }>
        {this._renderGameScreenStatus(stateText)}
        {this._renderGameScreenFrames()}
        {this._renderGameScreenRefresh()}
      </div>
    )
  }

  _renderGameScreenStatus(stateText) {
    return (
      <div style={ style.gameScreenStatus }>
        <span style={ style.gameScreenStatusValue }>{stateText}</span>
      </div>
    )
  }

  _renderGameScreenFrames() {
    var frames_img = 'images/presenter.png'
    return (
      <div style={ style.gameScreenFrames }>
        <img style={ style.gameScreenFramesValue } src={frames_img}></img>
      </div>
    )
  }

  _renderGameScreenRefresh() {
    return (
      <div style={ style.gameScreenRefresh }>
        <button style={ style.playButton } onClick={this._clickRefreshBtn.bind(this)}>刷新游戏</button>
      </div>
    )
  }

  _refreshUIView() {
    console.log('_refreshUIView::gameStatus=' + this.state.gameStatus)

    this._showLoading(false, '')
  }

  _showLoading(show, text){
    this.gameprops.loading_text = text
    this.setState({
      loading: show,
    })
  }

  _clickBtnCreateGame() {
    console.log('_clickBtnCreateGame::创建新游戏...')
    this._createGame()
  }

  _clickPlayerBtn(play_id) {
    console.log('_clickPlayerBtn::play_id=' + play_id)
    if(this.gameprops.gameIndex < 0){
      alert('没找到当前游戏！')
      return
    }

    let game = this.gameprops.gameDataList[this.gameprops.gameIndex]
    if(play_id == 1 && game.player1 == 1 || play_id == 2 && game.player2 == 1){
      alert('玩家已经开牌了！')
      return
    }

    this._playerOpenCard(game.id, play_id)
  }

  _clickRefreshBtn() {
    console.log('_clickRefreshBtn::... ...')
    this._updateGameData()
  }

}

const style = {
  container: {
    width: '100%',
    height: 1000,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundImage: 'url(images/bg.jpg)',
  },
  loadingBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.85,
    backgroundColor: '#000000',
  },
  loadingImage: {
    position: 'relative',
    width: '100%',
    height: 120,
    lineHeight: 120,
    alignItems: 'center',
    marginTop: 220,
    marginBottom: 30,
  },
  loadingImageImg: {
    position: 'absolute',
    left: '45%',
    width: 100,
    height: 100,
  },
  loadingText: {
    position: 'relative',
    width: '100%',
    height: 120,
    lineHeight: 120,
  },
  loadingTextValue: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '99%',
    height: 100,
    lineHeight: 2,
    color: '#ffffff',
    fontSize: 28,
    paddingTop: '-50',
    textAlign: 'center',
  },

  headerBox: {
    width: '100%',
    height: 180,
    padding: 5,
  },
  headerLogoBox: {
    float: 'left',
    width: 790,
    height: 180,
  },
  headerLogo: {
    width: 780,
    height: 160,
    marginTop: 10,
    marginLeft: 10,
  },
  headerRightBox: {
    float: 'left',
    width: 300,
    height: 180,
    lineHeight: 12,
  },
  headerRightBtn: {
    width: 120,
    height: 40,
  	borderColor: '#cdc9c9',
  	borderStyle: 'solid',
  	borderWidth: 1,
	  borderRadius: 3,
    color: '#ffffff',
    fontSize: 20,
    outline: 'none',
    marginLeft: 50,
    backgroundColor: '#ff3300',
  },

  bodyBox: {
    width: '100%',
    height: 'auto',
    paddingBottom: 25,
    marginBottom: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameBox: {
    width: '100%',
    height: 400,
    marginBottom: 35,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1.0,
  },
  emptyGamePrompt: {
    color: '#ff3300',
    fontSize: 28,
    marginTop: 50,
    marginLeft: 50,
  },
  gameBoxPlayer: {
    display: 'inline-block',
    width: 200,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 35,
  	borderColor: '#cdc9c9',
  	borderStyle: 'solid',
  	borderWidth: 1,
	  borderRadius: 3,
    backgroundColor: '#f3f3ff',
  },
  gamePlayerName: {
    width: '100%',
    height: 50,
    marginBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gamePlayerNameValue: {
    display: 'block',
    width: '100%',
    height: 36,
    paddingTop: 5,
    textAlign: 'center',
    color: '#ff3300',
    fontSize: 25,
  },
  gamePlayerImage: {
    width: 180,
    height: 200,
    marginLeft: 10,
    marginBottom: 0,
  },
  gamePlayerImageValue: {
    width: 180,
    height: 200,
  	borderColor: '#cdc9c9',
  	borderStyle: 'solid',
  	borderWidth: 1,
	  borderRadius: 3,
  },
  gamePlayerButton: {
    width: '100%',
    height: 50,
    marginTop: 5,
  },
  playButton: {
    width: 160,
    height: 40,
  	borderColor: '#cdc9c9',
  	borderStyle: 'solid',
  	borderWidth: 1,
	  borderRadius: 3,
    marginLeft: 20,
    marginTop: 5,
    color: '#ffffff',
    fontSize: 20,
    outline: 'none',
    backgroundColor: '#ff3300',
  },
  gameBoxScreen: {
    display: 'inline-block',
    width: 220,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 35,
  	borderColor: '#cdc9c9',
  	borderStyle: 'solid',
  	borderWidth: 1,
	  borderRadius: 3,
    backgroundColor: '#f3f3ff',
  },
  gameScreenStatus: {
    width: 200,
    height: 80,
  },
  gameScreenStatusValue: {
    display: 'block',
    width: '100%',
    height: 36,
    paddingTop: 20,
    marginTop: 20,
    marginLeft: 10,
    textAlign: 'center',
    color: '#ff3300',
    fontSize: 28,
  },
  gameScreenFrames: {
    width: 200,
    height: 200,
  	borderColor: '#cdc9c9',
  	borderStyle: 'solid',
  	borderWidth: 0,
	  borderRadius: 3,
    marginLeft: 10,
  },
  gameScreenFramesValue: {
    width: 120,
    height: 180,
    marginTop: 10,
    marginLeft: 40,
  },
  gameScreenRefresh: {
    width: 220,
    height: 80,
    textAlign: 'center',
  },

}

ReactDOM.render(<LuckPoint />, document.getElementById('app'));

module.hot.accept();
