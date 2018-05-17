/**
 *  @file
 *  @copyright defined in eos/LICENSE.txt
 */
#include <luckpoint.hpp>

void luckpoint::creategame(const account_name _owner) {
  // 创建一个全局引用计数器
  auto global_itr = globals.begin();
  if( global_itr == globals.end() ) {
     global_itr = globals.emplace(_self, [&](auto& gitr){
        gitr.nextgameid=0;
     });
  }

  // 增量引用计数器
  globals.modify(global_itr, 0, [&](auto& gitr){
     gitr.nextgameid++;
  });

  // 创建一个新游戏对象
  auto game_itr = games.emplace(_self, [&](auto& new_game){
     new_game.id          = global_itr->nextgameid;
     new_game.winner      = 0;
     new_game.player1     = 0;
     new_game.player2     = 0;
     new_game.createtime  = now();
     new_game.owner       = _owner;
  });
}

void luckpoint::opencard(uint64_t _gameid, const uint32_t _player) {
  eosio_assert( _player == 1 || _player == 2, "the player must is 1 or 2." );

  auto game_itr = games.find(_gameid);
  eosio_assert(game_itr != games.end(), "game not found");

  // 修改游戏数据状态
  games.modify( game_itr, 0, [&](auto& gitr) {
    if(_player == 1){
      gitr.player1 = 1;
    }else if(_player == 2){
      gitr.player2 = 1;
    }
    // 检查游戏是否已经决出胜出者
    _checkgame(_gameid);
  });
}

void luckpoint::sayhi(account_name receiver) {
  eosio::print("Hi~ luck point world!");
}

void luckpoint::printrand(uint64_t _gameid) {
  eosio::print("printrand::%d", _getrandnum(_gameid));
}

void luckpoint::_checkgame(uint64_t _gameid) {
  auto game_itr = games.find(_gameid);
  eosio_assert(game_itr != games.end(), "game not found");

  if(game_itr->player1 != 0 && game_itr->player2 != 0){
    games.modify( game_itr, 0, [&](auto& gitr) {
      gitr.winner = _getrandnum(_gameid);
    });
  }
}

uint32_t luckpoint::_getrandnum(uint64_t _gameid) {
  auto game_itr = games.find(_gameid);
  eosio_assert(game_itr != games.end(), "game id not found in games");

  // 随机数=游戏创建时间，取余2，再+1，保证是1、2中的任意一个
  return (((uint32_t)(game_itr->createtime))%2) + 1;
}

EOSIO_ABI( luckpoint, (creategame)(opencard)(sayhi)(printrand))
