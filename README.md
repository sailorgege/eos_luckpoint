# eos_luckpoint
EOS DAPP实战开发教程源码，包含前端的用户界面，和后端的智能合约代码。
开发者基于这套代码，可以开发出一个包含前后端的完整的DAPP结构出来。

源码说明：
-----------------------------------
实现了一个简单的用户界面，及简单的智能合约。


使用说明：
-----------------------------------

1、将git下来的www_luckpoint文件夹，放入eos目录下，与contracts、build、programs这些目录同级。
  将git下来的contracts目录下的luckpoint文件夹，放入contracts目录下。

2、控制台进入到www_luckpoint目录，安装依赖包：npm install --save

3、编译luckpoint合约，生成abi文件：
> cd ./contracts/luckpoint
>
> eosiocpp -o luckpoint.wast luckpoint.cpp
>
> eosiocpp -g luckpoint.abi luckpoint.cpp
>

4、启动eos节点：
> cd /你的eos所在父级目录/eos/build/programs/nodeos
>
> ./nodeos -e -p eosio --plugin eosio::wallet_api_plugin --plugin eosio::chain_api_plugin --plugin eosio::account_history_api_plugin

5、另起一个控制台，用户初始化钱包、合约等：
  cd /你的eos所在父级目录/eos

  // 创建钱包、导入私钥、创建及部署合约
> cleos wallet create
>
> cleos wallet unlock
>
> cleos wallet import 5JcziTgwUhQgKyvmvc4ygEPGonQPVrBYNTwezAg5UuJ7djyVDWQ
>
> cleos create account eosio luckpoint.co EOS6zzuh8wUHAmEftGNzHLRDCaxtVmTdBKWNCMDb9rF3DhQMB1XuQ EOS6zzuh8wUHAmEftGNzHLRDCaxtVmTdBKWNCMDb9rF3DhQMB1XuQ
>
> cleos set contract luckpoint.co ./contracts/luckpoint -p luckpoint.co

  // 创建banker、player1、player2这三个账户
>
> cleos create account eosio banker EOS6zzuh8wUHAmEftGNzHLRDCaxtVmTdBKWNCMDb9rF3DhQMB1XuQ EOS6zzuh8wUHAmEftGNzHLRDCaxtVmTdBKWNCMDb9rF3DhQMB1XuQ
>
> cleos create account eosio player1 EOS6zzuh8wUHAmEftGNzHLRDCaxtVmTdBKWNCMDb9rF3DhQMB1XuQ EOS6zzuh8wUHAmEftGNzHLRDCaxtVmTdBKWNCMDb9rF3DhQMB1XuQ
>
> cleos create account eosio player2 EOS6zzuh8wUHAmEftGNzHLRDCaxtVmTdBKWNCMDb9rF3DhQMB1XuQ EOS6zzuh8wUHAmEftGNzHLRDCaxtVmTdBKWNCMDb9rF3DhQMB1XuQ
>

6、再启动一个控制台，用于启动web服务：
> cd /你的eos所在父级目录/eos/www_luckpoint
>
> npm run start
>

7、用浏览器打开（建议用Chrome浏览器，便于调试）：http://localhost:8080/

8、开始游戏。


演示视频：
-----------------------------------
> http://v.youku.com/v_show/id_XMzYxMDU5OTk2NA==.html
>
