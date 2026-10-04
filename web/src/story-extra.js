


/* V110 authored dialogue. IDs, effects and choice ordering retained. */
(function(root){'use strict';
const data={
  "events": [
    {
      "id": "life_emptyseat",
      "speaker": "fan",
      "title": "空席の隣の一人",
      "text": "なつ「向こうの人、あなたの艇番を覚えてたよ」\n主人公「まだこんなに席が空いてるのに、ありがたいな」\nなつ「一人でも見てる人がいるね。準備が終わったら、声をかけてみる？」",
      "choices": [
        {
          "label": "手を振る",
          "effect": {
            "fame": 4
          },
          "reply": "次もここで見るよ、と声が返った。"
        },
        {
          "label": "きれいな航跡を約束",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "最初の観客へ、走りで応えようと思った。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 0,
      "maxFame": 25,
      "theme": "人気の物語"
    },
    {
      "id": "life_nametag",
      "speaker": "manager",
      "title": "名前を読む時間",
      "text": "七瀬「受付で、名前をもう一度お願いします」\n主人公「さっきも聞かれましたね」\n七瀬「これから覚えてもらいましょう。挨拶の後、練習の時間も取れますよ」",
      "choices": [
        {
          "label": "自己紹介を添える",
          "effect": {
            "fame": 3
          },
          "reply": "担当者が名前を言い直してくれた。"
        },
        {
          "label": "練習時間を確保",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "誰にも見られていない時間を、自分のために使った。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 0,
      "maxFame": 25,
      "theme": "人気の物語"
    },
    {
      "id": "life_backpage",
      "speaker": "press",
      "title": "小さな結果欄",
      "text": "柊「今日の新聞、ここに名前があります」\n主人公「小さいな。でも、自分だ」\n柊「地元へ届けますか。手元に残して、課題を書き足してもいいですね」",
      "choices": [
        {
          "label": "記事を届ける",
          "effect": {
            "fame": 4
          },
          "reply": "地元のお店が紙面を飾ってくれた。"
        },
        {
          "label": "課題を書き添える",
          "effect": {
            "worst": 0.4
          },
          "reply": "小さな記録が、次の目標になった。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 0,
      "maxFame": 25,
      "theme": "人気の物語"
    },
    {
      "id": "life_spareflag",
      "speaker": "fan",
      "title": "余った応援旗",
      "text": "なつ「旗、一本余ったけど……これは私が振るね」\n主人公「自分で自分の旗を振る所だった」\nなつ「それも見たいけど。次は、こっちから見つけるからね」",
      "choices": [
        {
          "label": "お礼を伝える",
          "effect": {
            "fame": 3
          },
          "reply": "桟橋からでも、その旗はよく見えた。"
        },
        {
          "label": "支える姿勢を確認",
          "effect": {
            "stat": "power",
            "value": 0.35
          },
          "reply": "最後まで走り切る約束を、姿勢に込めた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 0,
      "maxFame": 25,
      "theme": "人気の物語"
    },
    {
      "id": "life_quietpit",
      "speaker": "mechanic",
      "title": "呼ばれない午後",
      "text": "篠原「今日は取材がない。工具を二組出しておいた」\n主人公「静かですね。長めに聞いても？」\n篠原「構わん。モーターとプロペラ、どちらから触る？」",
      "choices": [
        {
          "label": "モーターを学ぶ",
          "effect": {
            "learn": "motor",
            "value": 0.35
          },
          "reply": "静かな時間に、始動音の違いを覚えた。"
        },
        {
          "label": "プロペラを学ぶ",
          "effect": {
            "learn": "prop",
            "value": 0.35
          },
          "reply": "水を受ける縁の形を見比べた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 0,
      "maxFame": 25,
      "theme": "人気の物語"
    },
    {
      "id": "life_firstwave",
      "speaker": "mentor",
      "title": "誰も知らない一周",
      "text": "朝倉「今の出口、艇を戻すのが早くなった」\n主人公「誰も見てないと思ってました」\n朝倉「俺はいたぞ。もう一本、何を確かめる？」",
      "choices": [
        {
          "label": "出口を繰り返す",
          "effect": {
            "stat": "accel",
            "value": 0.4
          },
          "reply": "小さな成功を、体に残した。"
        },
        {
          "label": "一本の直線を磨く",
          "effect": {
            "stat": "speed",
            "value": 0.4
          },
          "reply": "記録に残らない一本に、手応えがあった。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 0,
      "maxFame": 25,
      "theme": "人気の物語"
    },
    {
      "id": "life_regulars",
      "speaker": "fan",
      "title": "いつもの三人",
      "text": "なつ「いつもの三人から、今日の見どころを聞いておいてって」\n主人公「何となく応援、じゃなくなってきたな」\nなつ「ちゃんと見てるよ。教えるなら、どの場面にする？」",
      "choices": [
        {
          "label": "スタートを見て、と答える",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "見せたい場面がはっきりした。"
        },
        {
          "label": "一人ずつ話す",
          "effect": {
            "fame": 4
          },
          "reply": "応援する側の名前も、覚えられた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 25,
      "maxFame": 70,
      "theme": "人気の物語"
    },
    {
      "id": "life_shopwindow",
      "speaker": "manager",
      "title": "商店の窓",
      "text": "七瀬「地元のお店が、応援札を作ってくれました」\n主人公「窓に貼ってる。今度、お礼に行きたいですね」\n七瀬「遠征の支援も相談されています。準備費の話と、挨拶の予定を確認しましょう」",
      "choices": [
        {
          "label": "遠征支援を受ける",
          "effect": {
            "money": 8
          },
          "reply": "支援は準備に使おう。SG条件の賞金には加算されない。"
        },
        {
          "label": "店へ挨拶に行く",
          "effect": {
            "fame": 5
          },
          "reply": "店主が次の出走表を壁に貼った。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 25,
      "maxFame": 70,
      "theme": "人気の物語"
    },
    {
      "id": "life_namechant",
      "speaker": "fan",
      "title": "少し揃った呼び声",
      "text": "なつ「今日、名前を呼ぶタイミングが揃ってたでしょう」\n主人公「分かった。自分の番だと思ったら、急に緊張した」\nなつ「ごめん、驚かせたかな。でも、みんな次を楽しみにしてるよ」",
      "choices": [
        {
          "label": "丁寧に礼をする",
          "effect": {
            "fame": 4
          },
          "reply": "照れくささも含めて、応援してもらえた。"
        },
        {
          "label": "集中する呼吸を練習",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "歓声の中でも時計を見る練習をした。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 25,
      "maxFame": 70,
      "theme": "人気の物語"
    },
    {
      "id": "life_localradio",
      "speaker": "press",
      "title": "五分だけのラジオ",
      "text": "柊「ラジオで五分、出演の依頼です」\n主人公「五分なら短い……何を話せばいいですか」\n柊「得意な走りでも、失敗した話でも。先に一つ選んで、質問を整理しましょう」",
      "choices": [
        {
          "label": "失敗の話もする",
          "effect": {
            "fame": 5
          },
          "reply": "飾らない言葉に、感想が届いた。"
        },
        {
          "label": "得意な走りを説明",
          "effect": {
            "best": 0.35
          },
          "reply": "言葉にすると、自分の武器が整理できた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 25,
      "maxFame": 70,
      "theme": "人気の物語"
    },
    {
      "id": "life_fanroute",
      "speaker": "fan",
      "title": "遠征への地図",
      "text": "なつ「遠征先への乗り換え、調べてたんだ」\n主人公「そこまで来るの？　無理しないでくれよ」\nなつ「行ける人だけ、だよ。そっちも体調を整えて、準備してきてね」",
      "choices": [
        {
          "label": "感謝を伝える",
          "effect": {
            "fame": 5
          },
          "reply": "無理のない応援をお願いし、笑顔で別れた。"
        },
        {
          "label": "体調を整える",
          "effect": {
            "stat": "power",
            "value": 0.35
          },
          "reply": "遠くから来る人に、最後まで走る姿を見せたい。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 25,
      "maxFame": 70,
      "theme": "人気の物語"
    },
    {
      "id": "life_shortqueue",
      "speaker": "manager",
      "title": "小さな列",
      "text": "七瀬「サイン待ちが数人います。点検の時間も残してあります」\n主人公「両方いけますか」\n七瀬「先にどちらをするか決めましょう。待ってもらう場合は、私から時間を伝えます」",
      "choices": [
        {
          "label": "交流を楽しむ",
          "effect": {
            "fame": 4
          },
          "reply": "短い会話が、次の応援につながった。"
        },
        {
          "label": "点検を優先",
          "effect": {
            "gear": "motor",
            "value": 1.5
          },
          "reply": "待ってくれた人に礼を言い、機材と向き合った。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 25,
      "maxFame": 70,
      "theme": "人気の物語"
    },
    {
      "id": "life_hometown",
      "speaker": "press",
      "title": "地元代表の一言",
      "text": "柊「地元の顔として、一言お願いします」\n主人公「急に大きな話になりましたね」\n柊「普段の気持ちで大丈夫です。感謝でも、次にしたいことでも聞かせてください」",
      "choices": [
        {
          "label": "普段通りと答える",
          "effect": {
            "stat": "power",
            "value": 0.35
          },
          "reply": "背負いすぎず、いつもの姿勢を選んだ。"
        },
        {
          "label": "応援への感謝を話す",
          "effect": {
            "fame": 5
          },
          "reply": "一人で代表になるわけではないと伝えられた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 70,
      "maxFame": 140,
      "theme": "人気の物語"
    },
    {
      "id": "life_bannerwall",
      "speaker": "fan",
      "title": "横断幕が二枚",
      "text": "なつ「横断幕が増えたよ。こっちは別の人たちが作ったんだ」\n主人公「全部見つけられるかな」\nなつ「見つけなくても怒らないよ。走る準備をした後に、手を振ってくれたらうれしい」",
      "choices": [
        {
          "label": "両方に手を振る",
          "effect": {
            "fame": 5
          },
          "reply": "応援団同士が笑って話し始めた。"
        },
        {
          "label": "走りの課題に集中",
          "effect": {
            "worst": 0.4
          },
          "reply": "期待を理由に、弱い部分から逃げないと決めた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 70,
      "maxFame": 140,
      "theme": "人気の物語"
    },
    {
      "id": "life_schoolvisit",
      "speaker": "manager",
      "title": "放課後の質問",
      "text": "子供「速いのに負けることもあるの？」\n主人公「あるよ。曲がる時に流れたり、前の艇の波で跳ねたり」\n七瀬「実際の姿勢も見せられますか。説明だけより分かりそうです」",
      "choices": [
        {
          "label": "水面の難しさを伝える",
          "effect": {
            "fame": 5
          },
          "reply": "勝つまでに考えることも、面白がってくれた。"
        },
        {
          "label": "曲がる仕組みを実演",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "教えながら、重心の置き方を見直した。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 70,
      "maxFame": 140,
      "theme": "人気の物語"
    },
    {
      "id": "life_localfund",
      "speaker": "manager",
      "title": "街からの遠征費",
      "text": "七瀬「商店会から、遠征の準備費を支援したいそうです」\n主人公「賞金とは別に、助けてもらう形ですね」\n七瀬「はい。受け取るか、まず交流の機会を設けるか、希望を伝えましょう」",
      "choices": [
        {
          "label": "支援を受ける",
          "effect": {
            "money": 12
          },
          "reply": "準備費に回す。進出条件の賞金には含まれない。"
        },
        {
          "label": "交流の機会に変える",
          "effect": {
            "fame": 6
          },
          "reply": "顔の見えるつながりが増えた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 70,
      "maxFame": 140,
      "theme": "人気の物語"
    },
    {
      "id": "life_familiarcamera",
      "speaker": "press",
      "title": "慣れたカメラ",
      "text": "柊「今日は、構えた写真ではなく準備を追ってもいいですか」\n主人公「整備してる所とか？」\n柊「ええ。助走の確認でも。見せられる場面を教えてください」",
      "choices": [
        {
          "label": "整備を見せる",
          "effect": {
            "bond": "mechanic",
            "value": 1
          },
          "reply": "篠原の仕事にも光が当たった。"
        },
        {
          "label": "助走を見せる",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "見せるために、助走の手順を整理した。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 70,
      "maxFame": 140,
      "theme": "人気の物語"
    },
    {
      "id": "life_losingcheer",
      "speaker": "fan",
      "title": "負けても残る旗",
      "text": "主人公「負けても、旗を出してくれてたんだな」\nなつ「結果は残念だったけど、途中で応援をやめたりしないよ」\n主人公「ありがとう。次に直す所、少し話していい？」",
      "choices": [
        {
          "label": "次の約束をする",
          "effect": {
            "fame": 5
          },
          "reply": "結果だけを待っているのではないと分かった。"
        },
        {
          "label": "立ち上がりを直す",
          "effect": {
            "stat": "accel",
            "value": 0.4
          },
          "reply": "声援に甘えず、一つだけ改善する。"
        }
      ],
      "when": "loss",
      "rare": false,
      "minFame": 70,
      "maxFame": 140,
      "theme": "人気の物語"
    },
    {
      "id": "life_feature",
      "speaker": "press",
      "title": "特集の一ページ",
      "text": "柊「長めの特集になりました。華やかな話も期待されてます」\n主人公「ずっと華やかだったわけじゃないですけど」\n柊「その部分も聞きたいです。支えてくれた人か、走りの工夫か、どこから話します？」",
      "choices": [
        {
          "label": "支えてくれた人を話す",
          "effect": {
            "fame": 6
          },
          "reply": "記事に、自分以外の名前も載った。"
        },
        {
          "label": "走りの研究を話す",
          "effect": {
            "best": 0.4
          },
          "reply": "積み重ねてきた考えを一本の線にできた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 140,
      "maxFame": 250,
      "theme": "人気の物語"
    },
    {
      "id": "life_requeststack",
      "speaker": "manager",
      "title": "増えた依頼",
      "text": "七瀬「依頼を三色に分けました。全部は入りません」\n主人公「取材と交流と練習。どれも断りづらいですね」\n七瀬「一つ引き受けるか、練習を守るか。断る理由も、一緒に決めましょう」",
      "choices": [
        {
          "label": "交流を一つ引き受ける",
          "effect": {
            "fame": 6
          },
          "reply": "短い時間でも、丁寧に向き合えた。"
        },
        {
          "label": "練習時間を守る",
          "effect": {
            "worst": 0.4
          },
          "reply": "断る理由も伝え、必要な時間を残した。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 140,
      "maxFame": 250,
      "theme": "人気の物語"
    },
    {
      "id": "life_visitor",
      "speaker": "mentor",
      "title": "見に来た若手",
      "text": "朝倉「若手が練習を見たいそうだ。説明は頼めるか？」\n主人公「急に先生役ですか」\n朝倉「完璧な見本になれとは言ってない。助走の見方でも、失敗談でもいい」",
      "choices": [
        {
          "label": "助走の見方を教える",
          "effect": {
            "stat": "start",
            "value": 0.4
          },
          "reply": "基本を説明するほど、自分の目も確かになった。"
        },
        {
          "label": "失敗談を話す",
          "effect": {
            "fame": 5
          },
          "reply": "相手の緊張が、少しほどけた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 140,
      "maxFame": 250,
      "theme": "人気の物語"
    },
    {
      "id": "life_expectation",
      "speaker": "fan",
      "title": "勝って、と言われて",
      "text": "なつ「次は勝って……って言うと、重い？」\n主人公「少し。でも、勝ってほしいのは分かる」\nなつ「じゃあ、無理な約束をさせないようにする。今は何をしたらいい？」",
      "choices": [
        {
          "label": "正直に話す",
          "effect": {
            "fame": 4
          },
          "reply": "無理な約束をしなくても、応援は続いた。"
        },
        {
          "label": "呼吸と姿勢を整える",
          "effect": {
            "stat": "power",
            "value": 0.45
          },
          "reply": "期待を受け止める場所を、身体の中心に戻した。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 140,
      "maxFame": 250,
      "theme": "人気の物語"
    },
    {
      "id": "life_craftarticle",
      "speaker": "mechanic",
      "title": "選手と整備士",
      "text": "篠原「取材、二人で受けることになった」\n主人公「自分だけだと、整備の話は曖昧になりますから」\n篠原「俺も乗った感触は分からん。そこはお前が説明してくれ」",
      "choices": [
        {
          "label": "技術の話を聞く",
          "effect": {
            "learn": "prop",
            "value": 0.45
          },
          "reply": "説明を聞きながら、新しい見方を覚えた。"
        },
        {
          "label": "信頼を言葉にする",
          "effect": {
            "bond": "mechanic",
            "value": 1
          },
          "reply": "篠原が笑って工具を差し出した。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 140,
      "maxFame": 250,
      "theme": "人気の物語"
    },
    {
      "id": "life_travelvoice",
      "speaker": "fan",
      "title": "遠くの方言",
      "text": "ファン「次のレースも見ますよ！」\n主人公「ありがとうございます。こっちでも知ってくれてるんだ」\nなつ「地元の人みたい。挨拶のついでに、水面の話も聞けるかもしれないね」",
      "choices": [
        {
          "label": "挨拶を返す",
          "effect": {
            "fame": 6
          },
          "reply": "いつもの応援が、知らない街でも始まった。"
        },
        {
          "label": "水面の特徴を聞く",
          "effect": {
            "stat": "turn",
            "value": 0.4
          },
          "reply": "地元の人が教えてくれた風景を覚えた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 140,
      "maxFame": 250,
      "theme": "人気の物語"
    },
    {
      "id": "life_nationalmic",
      "speaker": "press",
      "title": "全国へ届く声",
      "text": "柊「全国放送です。緊張しています？」\n主人公「そう言われると、今しました」\n柊「いつものように。誰へ何を伝えるか、一つ決めれば話しやすいですよ」",
      "choices": [
        {
          "label": "地元の人へ伝える",
          "effect": {
            "fame": 7
          },
          "reply": "いつもの店から、見たよと連絡が来た。"
        },
        {
          "label": "勝負どころを宣言",
          "effect": {
            "best": 0.4
          },
          "reply": "言葉にした武器を、もう一度確かめた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 250,
      "maxFame": 400,
      "theme": "人気の物語"
    },
    {
      "id": "life_sponsorvisit",
      "speaker": "manager",
      "title": "支援の相談",
      "text": "七瀬「支援者の方が、準備を続けている所も見ていたそうです」\n主人公「勝った所だけじゃないんですね」\n七瀬「はい。準備費の支援か、育成交流の企画か、話を進められます」",
      "choices": [
        {
          "label": "準備費を受け取る",
          "effect": {
            "money": 20
          },
          "reply": "SG進出の賞金とは別に、所持金へ加わった。"
        },
        {
          "label": "育成交流を企画",
          "effect": {
            "fame": 8
          },
          "reply": "次の世代へ水面の楽しさを渡した。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 250,
      "maxFame": 400,
      "theme": "人気の物語"
    },
    {
      "id": "life_newstandard",
      "speaker": "mentor",
      "title": "見られる練習",
      "text": "朝倉「見学者は増えたが、今の舵の遅れは直ってないぞ」\n主人公「見てる人がいる時くらい、少し甘くしても」\n朝倉「本番で困るのはお前だろ。基本か、出口か。今日はどちらを見る？」",
      "choices": [
        {
          "label": "基本をやり直す",
          "effect": {
            "worst": 0.45
          },
          "reply": "肩書では曲がれない。足りない動きを補った。"
        },
        {
          "label": "速い出口を磨く",
          "effect": {
            "stat": "accel",
            "value": 0.45
          },
          "reply": "見せ場より、繰り返せる出口を選んだ。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 250,
      "maxFame": 400,
      "theme": "人気の物語"
    },
    {
      "id": "life_signedhelmet",
      "speaker": "fan",
      "title": "飾られたヘルメット",
      "text": "なつ「展示に、最初の横断幕の写真も入れたよ」\n主人公「懐かしいな。名前もまだ小さい」\nなつ「今につながる所も見てもらいたくて。最初に来た人にも、お礼を伝える？」",
      "choices": [
        {
          "label": "最初の応援へお礼",
          "effect": {
            "fame": 7
          },
          "reply": "増えたものの中で、変わらない顔を見つけた。"
        },
        {
          "label": "原点の直線練習",
          "effect": {
            "stat": "speed",
            "value": 0.4
          },
          "reply": "最初の一本と同じ気持ちで、水面へ出た。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 250,
      "maxFame": 400,
      "theme": "人気の物語"
    },
    {
      "id": "life_technicalcolumn",
      "speaker": "press",
      "title": "走りを語る欄",
      "text": "柊「技術コラム、短く書けそうですか」\n主人公「短くする方が難しいです。説明を抜くと伝わらない」\n柊「まず題材を絞りましょう。旋回か整備、一つを具体的に」",
      "choices": [
        {
          "label": "旋回を言葉にする",
          "effect": {
            "stat": "turn",
            "value": 0.45
          },
          "reply": "水をつかむ瞬間への理解が深まった。"
        },
        {
          "label": "整備を言葉にする",
          "effect": {
            "learn": "motor",
            "value": 0.45
          },
          "reply": "機材を見る順番を整理できた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 250,
      "maxFame": 400,
      "theme": "人気の物語"
    },
    {
      "id": "life_quietentrance",
      "speaker": "manager",
      "title": "別の入り口",
      "text": "七瀬「準備場所へは、今日は別の入り口を使います」\n主人公「そんなに人が来てます？」\n七瀬「はい。短い交流時間を作ることもできますが、休息を優先するなら伝えます」",
      "choices": [
        {
          "label": "短い交流時間を作る",
          "effect": {
            "fame": 6
          },
          "reply": "落ち着いて、一人ずつ向き合えた。"
        },
        {
          "label": "休息を優先",
          "effect": {
            "stat": "power",
            "value": 0.4
          },
          "reply": "忙しい日でも、自分の準備を守れた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 250,
      "maxFame": 400,
      "theme": "人気の物語"
    },
    {
      "id": "life_standanthem",
      "speaker": "fan",
      "title": "スタンドの合図",
      "text": "なつ「艇番が呼ばれたら、みんな同時に旗を出すんだ」\n主人公「すごそうだな。時計を見るのを忘れないようにしないと」\nなつ「返事は後でいいよ。出る前は、自分の準備に集中して」",
      "choices": [
        {
          "label": "深く礼をする",
          "effect": {
            "fame": 8
          },
          "reply": "大きくなった応援に、いつもの仕草で応えた。"
        },
        {
          "label": "十二秒へ集中",
          "effect": {
            "stat": "start",
            "value": 0.45
          },
          "reply": "歓声の向こうに、針の動きだけを残した。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 400,
      "maxFame": Infinity,
      "theme": "人気の物語"
    },
    {
      "id": "life_frontcover",
      "speaker": "press",
      "title": "表紙になった日",
      "text": "柊「表紙、見ました？」\n主人公「自分じゃないみたいでした。こんな顔して走ってるのか」\n柊「中の記事では、普段の話も載せたいです。次の課題もありますよね」",
      "choices": [
        {
          "label": "素顔の話をする",
          "effect": {
            "fame": 7
          },
          "reply": "憧れだけでなく、近さも届いた。"
        },
        {
          "label": "課題を見直す",
          "effect": {
            "worst": 0.45
          },
          "reply": "表紙になっても、練習帳には課題がある。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 400,
      "maxFame": Infinity,
      "theme": "人気の物語"
    },
    {
      "id": "life_nextgeneration",
      "speaker": "mentor",
      "title": "追われる背中",
      "text": "若手「レース、何度も見ました。今度は追いつきたいです」\n主人公「言われる側になると、うれしいし少し怖いな」\n朝倉「次の相手かもしれんぞ。一緒に練習するなら、遠慮は要らない」",
      "choices": [
        {
          "label": "一緒に練習する",
          "effect": {
            "stat": "turn",
            "value": 0.4
          },
          "reply": "教える時間が、自分の基礎を磨いた。"
        },
        {
          "label": "挑戦を歓迎する",
          "effect": {
            "fame": 8
          },
          "reply": "次のレースの約束を交わした。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 400,
      "maxFame": Infinity,
      "theme": "人気の物語"
    },
    {
      "id": "life_charity",
      "speaker": "manager",
      "title": "水辺の体験会",
      "text": "七瀬「水辺の体験会で、競技の話をお願いできますか」\n主人公「まだレースを知らない人も来ます？」\n七瀬「ええ。話すか、準備を実演するか。初めての人に伝わる方法を選びましょう」",
      "choices": [
        {
          "label": "話し手を引き受ける",
          "effect": {
            "fame": 9
          },
          "reply": "まだレースを知らなかった人が、興味を持った。"
        },
        {
          "label": "準備の実演をする",
          "effect": {
            "learn": "prop",
            "value": 0.45
          },
          "reply": "機材を丁寧に扱う姿も、楽しんでもらえた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 400,
      "maxFame": Infinity,
      "theme": "人気の物語"
    },
    {
      "id": "life_oldseat",
      "speaker": "fan",
      "title": "最初の席",
      "text": "主人公「こんなに人が増えても、最初の席は分かるな」\nなつ「そこにいる人も同じだよ。今日も見てる」\n主人公「準備が終わったら手を振る。まず、最後まで走る体を作らないと」",
      "choices": [
        {
          "label": "小さく手を振る",
          "effect": {
            "fame": 7
          },
          "reply": "昔と同じ旗が返ってきた。"
        },
        {
          "label": "最後まで支える練習",
          "effect": {
            "stat": "power",
            "value": 0.45
          },
          "reply": "大きくなった名前を、足元から支え直した。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 400,
      "maxFame": Infinity,
      "theme": "人気の物語"
    },
    {
      "id": "life_legacytool",
      "speaker": "mechanic",
      "title": "残していく整備帳",
      "text": "篠原「新しい整備帳だ。次の人にも読めるように書いてくれ」\n主人公「自分だけ分かる略し方ばかりしてました」\n篠原「それを直す所からでいい。何を見て調整したか、理由も残そう」",
      "choices": [
        {
          "label": "整備の知見を残す",
          "effect": {
            "learn": "motor",
            "value": 0.5
          },
          "reply": "感覚だったものを、伝わる知識へ変えた。"
        },
        {
          "label": "感謝の一文を残す",
          "effect": {
            "bond": "mechanic",
            "value": 1
          },
          "reply": "篠原は黙って、そのページを丁寧に閉じた。"
        }
      ],
      "when": "any",
      "rare": false,
      "minFame": 400,
      "maxFame": Infinity,
      "theme": "人気の物語"
    },
    {
      "id": "life_crosswindlesson",
      "speaker": "mentor",
      "title": "斜めの水しぶき",
      "text": "主人公「今日は、ずいぶん横へ押されますね」\n朝倉「旗だけでなく、艇が流れ始める所を見ろ」\n主人公「姿勢で受けるか、先に舵を作るか。両方の違いを確かめたいです」",
      "choices": [
        {
          "label": "身体で受ける",
          "effect": {
            "stat": "power",
            "value": 0.4
          },
          "reply": "フィジカルの動作を確認し、短い練習で試した。"
        },
        {
          "label": "早く舵を作る",
          "effect": {
            "stat": "turn",
            "value": 0.4
          },
          "reply": "風が押す分を見込んで回った。"
        }
      ],
      "when": "wind",
      "rare": false,
      "theme": "水面を読む",
      "branches": [
        {
          "minFame": 0,
          "text": "朝倉「見学者は少ないが、今日は風の変化を調べるにはいい。一本ずつ残そう」\n主人公「今日は、ずいぶん横へ押されますね」\n朝倉「旗だけでなく、艇が流れ始める所を見ろ」\n主人公「姿勢で受けるか、先に舵を作るか。両方の違いを確かめたいです」"
        },
        {
          "minFame": 140,
          "text": "朝倉「見学の人がいても、風に合わせる所は変わらない。派手に走るために無理はするな」\n主人公「今日は、ずいぶん横へ押されますね」\n朝倉「旗だけでなく、艇が流れ始める所を見ろ」\n主人公「姿勢で受けるか、先に舵を作るか。両方の違いを確かめたいです」",
          "choices": [
            {
              "label": "身体で受ける",
              "effect": {
                "stat": "power",
                "value": 0.4
              },
              "reply": "フィジカルの動作を確認し、短い練習で試した。"
            },
            {
              "label": "経験を周囲へ伝える",
              "effect": {
                "fame": 5
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_wetgloves",
      "speaker": "mechanic",
      "title": "雨の日の握り方",
      "text": "篠原「濡れた手袋で、いつも通り握れるか？」\n主人公「少し滑ります。力を入れすぎそうだ」\n篠原「握りを確認してから出ろ。機材の点検も、雨だからと急ぐなよ」",
      "choices": [
        {
          "label": "握りを安定させる",
          "effect": {
            "stat": "power",
            "value": 0.4
          },
          "reply": "フィジカルの動作を確認し、短い練習で試した。"
        },
        {
          "label": "点検を丁寧にする",
          "effect": {
            "gear": "prop",
            "value": 2
          },
          "reply": "雨の中でも見落とさず仕上げた。"
        }
      ],
      "when": "rain",
      "rare": false,
      "theme": "水面を読む",
      "branches": [
        {
          "minFame": 0,
          "text": "篠原「まだ静かだ。取材を気にせず、握りと道具を確認できるな」\n篠原「濡れた手袋で、いつも通り握れるか？」\n主人公「少し滑ります。力を入れすぎそうだ」\n篠原「握りを確認してから出ろ。機材の点検も、雨だからと急ぐなよ」"
        },
        {
          "minFame": 140,
          "text": "篠原「カメラが待っていても、濡れた道具の確認は飛ばすなよ」\n篠原「濡れた手袋で、いつも通り握れるか？」\n主人公「少し滑ります。力を入れすぎそうだ」\n篠原「握りを確認してから出ろ。機材の点検も、雨だからと急ぐなよ」",
          "choices": [
            {
              "label": "握りを安定させる",
              "effect": {
                "stat": "power",
                "value": 0.4
              },
              "reply": "フィジカルの動作を確認し、短い練習で試した。"
            },
            {
              "label": "経験を周囲へ伝える",
              "effect": {
                "fame": 5
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_comebackline",
      "speaker": "mentor",
      "title": "負けた線の先",
      "text": "朝倉「負けた時の出口、もう一度見られるか」\n主人公「気分はよくないです。でも、直す場所は知りたい」\n朝倉「なら一つだけ選ぼう。次に試すことまで決めれば、今日は終わりでいい」",
      "choices": [
        {
          "label": "出口を磨く",
          "effect": {
            "stat": "accel",
            "value": 0.45
          },
          "reply": "加速の動作を確認し、短い練習で試した。"
        },
        {
          "label": "基本へ戻る",
          "effect": {
            "worst": 0.45
          },
          "reply": "苦しさを、練習の一歩へ変えた。"
        }
      ],
      "when": "loss",
      "rare": false,
      "theme": "再起",
      "branches": [
        {
          "minFame": 0,
          "text": "朝倉「まだ知らない人が多い時期だ。今のうちに、直したい動きを一つ試そう」\n朝倉「負けた時の出口、もう一度見られるか」\n主人公「気分はよくないです。でも、直す場所は知りたい」\n朝倉「なら一つだけ選ぼう。次に試すことまで決めれば、今日は終わりでいい」"
        },
        {
          "minFame": 140,
          "text": "朝倉「注目された分だけ悔しいだろうが、直す動きは同じだ。着順の話は後にしよう」\n朝倉「負けた時の出口、もう一度見られるか」\n主人公「気分はよくないです。でも、直す場所は知りたい」\n朝倉「なら一つだけ選ぼう。次に試すことまで決めれば、今日は終わりでいい」",
          "choices": [
            {
              "label": "出口を磨く",
              "effect": {
                "stat": "accel",
                "value": 0.45
              },
              "reply": "加速の動作を確認し、短い練習で試した。"
            },
            {
              "label": "経験を周囲へ伝える",
              "effect": {
                "fame": 5
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_winningroutine",
      "speaker": "manager",
      "title": "勝った日の片づけ",
      "text": "七瀬「おめでとうございます。記録と片づけは、いつもの順番で」\n主人公「浮かれて、飛ばしそうでした」\n七瀬「喜ぶ時間も取りますよ。その前に、次も使いたいことを残しておきましょう」",
      "choices": [
        {
          "label": "成功を記録する",
          "effect": {
            "best": 0.35
          },
          "reply": "得意な動きを説明し、同じ条件で試し直した。"
        },
        {
          "label": "仲間に感謝する",
          "effect": {
            "fame": 4
          },
          "reply": "喜びを分けると、準備へ戻りやすくなった。"
        }
      ],
      "when": "win",
      "rare": false,
      "theme": "積み重ね",
      "branches": [
        {
          "minFame": 0,
          "text": "七瀬「取材はまだ少ないので、今日はゆっくり片づけられます」\n七瀬「おめでとうございます。記録と片づけは、いつもの順番で」\n主人公「浮かれて、飛ばしそうでした」\n七瀬「喜ぶ時間も取りますよ。その前に、次も使いたいことを残しておきましょう」"
        },
        {
          "minFame": 140,
          "text": "七瀬「取材の依頼が来ていますが、記録を取る時間は先に残してあります」\n七瀬「おめでとうございます。記録と片づけは、いつもの順番で」\n主人公「浮かれて、飛ばしそうでした」\n七瀬「喜ぶ時間も取りますよ。その前に、次も使いたいことを残しておきましょう」",
          "choices": [
            {
              "label": "成功を記録する",
              "effect": {
                "best": 0.35
              },
              "reply": "得意な動きを説明し、同じ条件で試し直した。"
            },
            {
              "label": "経験を周囲へ伝える",
              "effect": {
                "fame": 5
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_standingovation",
      "speaker": "fan",
      "title": "席を立った拍手",
      "text": "なつ「ゴールした後も、拍手が止まらなかったね」\n主人公「まだ、少し手が震えてる」\nなつ「応えに行く？　それとも、今の走りを先に記録する？」",
      "choices": [
        {
          "label": "声に応える",
          "effect": {
            "fame": 18
          },
          "reply": "あなたの走りが、誰かの記憶に残った。"
        },
        {
          "label": "感覚を刻む",
          "effect": {
            "best": 1.3
          },
          "reply": "大きな拍手の理由を、自分の動きから探した。"
        }
      ],
      "when": "win",
      "rare": true,
      "tone": "surge",
      "minFame": 140,
      "theme": "人気の転機"
    },
    {
      "id": "life_anonymousgift",
      "speaker": "manager",
      "title": "名前のない支援",
      "text": "七瀬「名前のない支援が届きました。初出走から見ていたそうです」\n主人公「誰だろう。直接お礼を言いたいけど」\n七瀬「名乗らない希望もあるのでしょう。公開のお礼か、準備への活用を考えましょう」",
      "choices": [
        {
          "label": "準備へ役立てる",
          "effect": {
            "money": 30
          },
          "reply": "所持金へ支援が加わった。賞金条件とは別の支えだ。"
        },
        {
          "label": "公開のお礼を伝える",
          "effect": {
            "fame": 14
          },
          "reply": "見えないところにいる応援へ、言葉を届けた。"
        }
      ],
      "when": "any",
      "rare": true,
      "tone": "surge",
      "maxFame": 140,
      "theme": "小さな奇跡"
    },
    {
      "id": "life_craftbreak",
      "speaker": "mechanic",
      "title": "整備帳の答え",
      "text": "篠原「前のメモと、今日の違いがつながった」\n主人公「調整の理由が分かったんですか」\n篠原「ああ。一度に両方は変えない。どちらから仕上げる？」",
      "choices": [
        {
          "label": "モーターを仕上げる",
          "effect": {
            "gear": "motor",
            "value": 7
          },
          "reply": "回転の音が、いつもより澄んだ。"
        },
        {
          "label": "プロペラを仕上げる",
          "effect": {
            "gear": "prop",
            "value": 7
          },
          "reply": "出口で水をつかむ期待が高まった。"
        }
      ],
      "when": "bondMechanic",
      "rare": true,
      "tone": "surge",
      "theme": "積み重ねの実り"
    },
    {
      "id": "life_mentorletter",
      "speaker": "mentor",
      "title": "先輩からの推薦",
      "text": "朝倉「紹介状だ。教える側も、お前の走りを見たいそうだ」\n主人公「期待されると、緊張しますね」\n朝倉「技を習うか、受け止める基礎を固めるか。今日の目的は決めて行け」",
      "choices": [
        {
          "label": "技を学びに行く",
          "effect": {
            "skill": true
          },
          "reply": "自分の走りへ、新しい選択肢が加わった。"
        },
        {
          "label": "基礎を固める",
          "effect": {
            "worst": 1.5
          },
          "reply": "学びを受け止める土台を整えた。"
        }
      ],
      "when": "bondMentor",
      "rare": true,
      "tone": "surge",
      "theme": "信頼の実り"
    },
    {
      "id": "life_busyweek",
      "speaker": "manager",
      "title": "予定の重なり",
      "text": "七瀬「面会の時間が重なりました。私の確認不足です」\n主人公「全部行くと、準備が足りなくなりますね」\n七瀬「一件を延期するか、会場の手配で時間を縮めるか。費用も含めて相談させてください」",
      "choices": [
        {
          "label": "一件を延期する",
          "effect": {
            "fame": -3
          },
          "reply": "事情を伝え、準備の時間を守った。"
        },
        {
          "label": "会場手配を頼む",
          "effect": {
            "cost": 6
          },
          "reply": "短い時間で会えるように整えてもらった。"
        }
      ],
      "when": "any",
      "rare": false,
      "tone": "setback",
      "minFame": 140,
      "theme": "人気の裏側"
    },
    {
      "id": "life_rumor",
      "speaker": "press",
      "title": "伝言の途中",
      "text": "柊「発言の一部だけが伝わって、別の話になっています」\n主人公「言い返したくなるな」\n柊「その前に、何を訂正するか決めましょう。説明の場を作る方法もあります」",
      "choices": [
        {
          "label": "自分の言葉で訂正",
          "effect": {
            "fame": -3
          },
          "reply": "急がず説明し、誤解をほどいた。"
        },
        {
          "label": "説明の場を作る",
          "effect": {
            "cost": 6
          },
          "reply": "顔を合わせると、相手も耳を傾けてくれた。"
        }
      ],
      "when": "any",
      "rare": false,
      "tone": "setback",
      "minFame": 70,
      "theme": "人気の裏側"
    },
    {
      "id": "life_saltmist",
      "speaker": "mechanic",
      "title": "潮風の小さな錆",
      "text": "篠原「潮風で錆が出てる。ここは手入れが要る」\n主人公「見落としてました。今できることは？」\n篠原「応急処置か、費用を使って補修するか。状態の差を説明する」",
      "choices": [
        {
          "label": "応急処置をする",
          "effect": {
            "gear": "motor",
            "value": -3
          },
          "reply": "状態は少し落ちた。調整で取り戻せる。"
        },
        {
          "label": "補修を依頼",
          "effect": {
            "cost": 6
          },
          "reply": "機材を整えて出走に備えた。"
        }
      ],
      "when": "any",
      "rare": false,
      "tone": "setback",
      "theme": "ピットのトラブル"
    },
    {
      "id": "life_scratchcase",
      "speaker": "mechanic",
      "title": "ケースの擦り傷",
      "text": "主人公「ケースを開けたら、擦り跡がありました」\n篠原「見せてくれ。輸送中に当たったかもしれん」\n主人公「ここで整えるか、仕上げ直しを頼むか。出るまでに決めましょう」",
      "choices": [
        {
          "label": "その場で整える",
          "effect": {
            "gear": "prop",
            "value": -3
          },
          "reply": "小さな低下にとどめた。次の整備で取り戻そう。"
        },
        {
          "label": "仕上げ直しを頼む",
          "effect": {
            "cost": 6
          },
          "reply": "丁寧な仕上げで、不安を残さず準備できた。"
        }
      ],
      "when": "any",
      "rare": false,
      "tone": "setback",
      "theme": "ピットのトラブル"
    },
    {
      "id": "life_banner_0",
      "speaker": "fan",
      "title": "余白の布",
      "text": "なつが、まだ何も書いていない布を広げた。\nなつ「名前を大きくする？　走ってる線の絵も入れたいんだけど」\n主人公「欲張ると、どっちも小さくなりそうだな」\nなつ「そう。だから、最初に一つ決めたいの」\n主人公「せっかくだし、一緒に考えよう」",
      "choices": [
        {
          "label": "名前を大きく",
          "effect": {
            "fame": 3
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        },
        {
          "label": "走りの線を描く",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "旋回の動作を確認し、短い練習で試した。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "banner",
      "step": 0,
      "arcName": "一枚の横断幕",
      "minFame": 0,
      "minStage": 0,
      "theme": "連続イベント"
    },
    {
      "id": "life_banner_1",
      "speaker": "fan",
      "title": "布に残る線",
      "text": "なつ「できたよ。前に選んだ案を使ってみた」\n主人公「離れて見ると、ちゃんと目立つね」\nなつ「次は、これを持って応援する人にも会ってほしいな」\n主人公「うん。練習の後なら話せる。得意な走りも、もう少し磨いておきたい」",
      "choices": [
        {
          "label": "応援団へ挨拶",
          "effect": {
            "fame": 4
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        },
        {
          "label": "得意を磨く",
          "effect": {
            "best": 0.35
          },
          "reply": "得意な動きを説明し、同じ条件で試し直した。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "banner",
      "step": 1,
      "arcName": "一枚の横断幕",
      "minFame": 0,
      "minStage": 0,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "なつ「最初に選んだ大きな名前、初めての人にも読めるって」\nなつ「できたよ。前に選んだ案を使ってみた」\n主人公「離れて見ると、ちゃんと目立つね」\nなつ「次は、これを持って応援する人にも会ってほしいな」\n主人公「うん。練習の後なら話せる。得意な走りも、もう少し磨いておきたい」",
          "choices": [
            {
              "label": "名前を大きく",
              "effect": {
                "fame": 3
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            },
            {
              "label": "得意を磨く",
              "effect": {
                "best": 0.35
              },
              "reply": "得意な動きを説明し、同じ条件で試し直した。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "なつ「最初に選んだ走りの絵、あのターンだねって言ってもらえたよ」\nなつ「できたよ。前に選んだ案を使ってみた」\n主人公「離れて見ると、ちゃんと目立つね」\nなつ「次は、これを持って応援する人にも会ってほしいな」\n主人公「うん。練習の後なら話せる。得意な走りも、もう少し磨いておきたい」",
          "choices": [
            {
              "label": "走りの線を描く",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "旋回の動作を確認し、短い練習で試した。"
            },
            {
              "label": "応援団へ挨拶",
              "effect": {
                "fame": 4
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_banner_2",
      "speaker": "fan",
      "title": "雨にも消えない",
      "text": "何度も雨に濡れた横断幕は、色が薄くなっていた。\n主人公「ずいぶん使ってくれたんだな」\nなつ「まだ使うよ。文字と線を直そうと思って」\n主人公「自分も手伝おうか」\nなつ「ありがとう。走る方の予定もあるでしょう。無理のない方を選んで」",
      "choices": [
        {
          "label": "一緒に手直し",
          "effect": {
            "fame": 7
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        },
        {
          "label": "走りで恩返し",
          "effect": {
            "stat": "power",
            "value": 0.55
          },
          "reply": "フィジカルの動作を確認し、短い練習で試した。"
        }
      ],
      "when": "any",
      "rare": true,
      "arc": "banner",
      "step": 2,
      "arcName": "一枚の横断幕",
      "minFame": 0,
      "minStage": 0,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "なつ「最初に選んだ大きな名前、初めての人にも読めるって」\n何度も雨に濡れた横断幕は、色が薄くなっていた。\n主人公「ずいぶん使ってくれたんだな」\nなつ「まだ使うよ。文字と線を直そうと思って」\n主人公「自分も手伝おうか」\nなつ「ありがとう。走る方の予定もあるでしょう。無理のない方を選んで」",
          "choices": [
            {
              "label": "名前を大きく",
              "effect": {
                "fame": 3
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            },
            {
              "label": "走りで恩返し",
              "effect": {
                "stat": "power",
                "value": 0.55
              },
              "reply": "フィジカルの動作を確認し、短い練習で試した。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "なつ「最初に選んだ走りの絵、あのターンだねって言ってもらえたよ」\n何度も雨に濡れた横断幕は、色が薄くなっていた。\n主人公「ずいぶん使ってくれたんだな」\nなつ「まだ使うよ。文字と線を直そうと思って」\n主人公「自分も手伝おうか」\nなつ「ありがとう。走る方の予定もあるでしょう。無理のない方を選んで」",
          "choices": [
            {
              "label": "走りの線を描く",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "旋回の動作を確認し、短い練習で試した。"
            },
            {
              "label": "一緒に手直し",
              "effect": {
                "fame": 7
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_craft_0",
      "speaker": "mechanic",
      "title": "一冊目の整備帳",
      "text": "篠原「一冊渡す。整備の記録に使え」\n主人公「何から書けばいいですか」\n篠原「音か、形か。まず一つ比べられる物を選べ」\n主人公「両方書いて、結局何も比べられなくなる所でした」",
      "choices": [
        {
          "label": "音を記録する",
          "effect": {
            "learn": "motor",
            "value": 0.25
          },
          "reply": "モーターの回転と音を、記録と比べて確かめた。"
        },
        {
          "label": "形を記録する",
          "effect": {
            "learn": "prop",
            "value": 0.25
          },
          "reply": "プロペラの形と水の受け方を、記録と比べて確かめた。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "craft",
      "step": 0,
      "arcName": "整備帳の余白",
      "minFame": 0,
      "minStage": 0,
      "theme": "連続イベント"
    },
    {
      "id": "life_craft_1",
      "speaker": "mechanic",
      "title": "違いを言葉に",
      "text": "篠原「前に書いた所と、今日を比べてみろ」\n主人公「違いは分かります。でも、理由を説明できない」\n篠原「そこまで分かれば聞ける。先に答えを写すより、覚えやすいだろ」\n主人公「走った時に何が変わるかも、試したいです」",
      "choices": [
        {
          "label": "理由を聞く",
          "effect": {
            "bond": "mechanic",
            "value": 1
          },
          "reply": "気になったことを聞き、説明を最後まで確かめた。"
        },
        {
          "label": "出口を試す",
          "effect": {
            "stat": "accel",
            "value": 0.35
          },
          "reply": "加速の動作を確認し、短い練習で試した。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "craft",
      "step": 1,
      "arcName": "整備帳の余白",
      "minFame": 0,
      "minStage": 0,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "篠原「最初に記録した始動音を出せ。今日の回転と比べられる」\n篠原「前に書いた所と、今日を比べてみろ」\n主人公「違いは分かります。でも、理由を説明できない」\n篠原「そこまで分かれば聞ける。先に答えを写すより、覚えやすいだろ」\n主人公「走った時に何が変わるかも、試したいです」",
          "choices": [
            {
              "label": "音を記録する",
              "effect": {
                "learn": "motor",
                "value": 0.25
              },
              "reply": "モーターの回転と音を、記録と比べて確かめた。"
            },
            {
              "label": "出口を試す",
              "effect": {
                "stat": "accel",
                "value": 0.35
              },
              "reply": "加速の動作を確認し、短い練習で試した。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "篠原「最初に描いた形を重ねてみろ。縁のどこが違うか分かるぞ」\n篠原「前に書いた所と、今日を比べてみろ」\n主人公「違いは分かります。でも、理由を説明できない」\n篠原「そこまで分かれば聞ける。先に答えを写すより、覚えやすいだろ」\n主人公「走った時に何が変わるかも、試したいです」",
          "choices": [
            {
              "label": "形を記録する",
              "effect": {
                "learn": "prop",
                "value": 0.25
              },
              "reply": "プロペラの形と水の受け方を、記録と比べて確かめた。"
            },
            {
              "label": "理由を聞く",
              "effect": {
                "bond": "mechanic",
                "value": 1
              },
              "reply": "気になったことを聞き、説明を最後まで確かめた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_craft_2",
      "speaker": "mechanic",
      "title": "自分の整備帳",
      "text": "主人公「ノート、もう半分使いました」\n篠原「読む順番も決まってきたな。今日は、記録を使って一つ仕上げろ」\n主人公「手順を見てもらえますか」\n篠原「ああ。ただし、先にお前が理由を説明するんだぞ」",
      "choices": [
        {
          "label": "モーターを仕上げる",
          "effect": {
            "gear": "motor",
            "value": 3
          },
          "reply": "モーターの状態を確認し、選んだ方法で整備した。"
        },
        {
          "label": "プロペラを仕上げる",
          "effect": {
            "gear": "prop",
            "value": 3
          },
          "reply": "プロペラの状態を確認し、選んだ方法で整備した。"
        }
      ],
      "when": "any",
      "rare": true,
      "arc": "craft",
      "step": 2,
      "arcName": "整備帳の余白",
      "minFame": 0,
      "minStage": 0,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "篠原「最初に記録した始動音を出せ。今日の回転と比べられる」\n主人公「ノート、もう半分使いました」\n篠原「読む順番も決まってきたな。今日は、記録を使って一つ仕上げろ」\n主人公「手順を見てもらえますか」\n篠原「ああ。ただし、先にお前が理由を説明するんだぞ」",
          "choices": [
            {
              "label": "音を記録する",
              "effect": {
                "learn": "motor",
                "value": 0.25
              },
              "reply": "モーターの回転と音を、記録と比べて確かめた。"
            },
            {
              "label": "プロペラを仕上げる",
              "effect": {
                "gear": "prop",
                "value": 3
              },
              "reply": "プロペラの状態を確認し、選んだ方法で整備した。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "篠原「最初に描いた形を重ねてみろ。縁のどこが違うか分かるぞ」\n主人公「ノート、もう半分使いました」\n篠原「読む順番も決まってきたな。今日は、記録を使って一つ仕上げろ」\n主人公「手順を見てもらえますか」\n篠原「ああ。ただし、先にお前が理由を説明するんだぞ」",
          "choices": [
            {
              "label": "形を記録する",
              "effect": {
                "learn": "prop",
                "value": 0.25
              },
              "reply": "プロペラの形と水の受け方を、記録と比べて確かめた。"
            },
            {
              "label": "モーターを仕上げる",
              "effect": {
                "gear": "motor",
                "value": 3
              },
              "reply": "モーターの状態を確認し、選んだ方法で整備した。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_press_0",
      "speaker": "press",
      "title": "最初の質問",
      "text": "柊「最初に、何を伝えたいですか」\n主人公「勝ちたい、だけだと短すぎますね」\n柊「そこへ来るまでの話も聞きたいです。支えてくれた人か、工夫している走りか」\n主人公「では、どこから話すか決めます」",
      "choices": [
        {
          "label": "人のつながり",
          "effect": {
            "fame": 3
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        },
        {
          "label": "走りの工夫",
          "effect": {
            "best": 0.3
          },
          "reply": "得意な動きを説明し、同じ条件で試し直した。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "press",
      "step": 0,
      "arcName": "名前の載る記事",
      "minFame": 25,
      "minStage": 0,
      "theme": "連続イベント"
    },
    {
      "id": "life_press_1",
      "speaker": "press",
      "title": "原稿の確認",
      "text": "柊「原稿ができました。足りない所を確認してください」\n主人公「名前を載せたい人がいます。技術の説明も、少し省きすぎかも」\n柊「どちらも聞きます。まず、前に選んだ話の続きから」\n主人公「自分で読むと、言い足りなかった所が分かるな」",
      "choices": [
        {
          "label": "仲間の名前を添える",
          "effect": {
            "bond": "mentor",
            "value": 1
          },
          "reply": "気になったことを聞き、説明を最後まで確かめた。"
        },
        {
          "label": "技術を補足する",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "旋回の動作を確認し、短い練習で試した。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "press",
      "step": 1,
      "arcName": "名前の載る記事",
      "minFame": 25,
      "minStage": 0,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "柊「人のつながりを話した記事に、応援の便りが来ています」\n柊「原稿ができました。足りない所を確認してください」\n主人公「名前を載せたい人がいます。技術の説明も、少し省きすぎかも」\n柊「どちらも聞きます。まず、前に選んだ話の続きから」\n主人公「自分で読むと、言い足りなかった所が分かるな」",
          "choices": [
            {
              "label": "人のつながり",
              "effect": {
                "fame": 3
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            },
            {
              "label": "技術を補足する",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "旋回の動作を確認し、短い練習で試した。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "柊「走りの工夫を読んだ若手から、詳しく聞きたいと連絡が来ました」\n柊「原稿ができました。足りない所を確認してください」\n主人公「名前を載せたい人がいます。技術の説明も、少し省きすぎかも」\n柊「どちらも聞きます。まず、前に選んだ話の続きから」\n主人公「自分で読むと、言い足りなかった所が分かるな」",
          "choices": [
            {
              "label": "走りの工夫",
              "effect": {
                "best": 0.3
              },
              "reply": "得意な動きを説明し、同じ条件で試し直した。"
            },
            {
              "label": "仲間の名前を添える",
              "effect": {
                "bond": "mentor",
                "value": 1
              },
              "reply": "気になったことを聞き、説明を最後まで確かめた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_press_2",
      "speaker": "press",
      "title": "届いた感想",
      "text": "柊「記事を読んで、初めて見に来たという便りです」\n主人公「次も楽しみって書いてある。うれしいけど、緊張するな」\n柊「お返事は届けられます。次の練習の話をしても、喜ばれると思いますよ」\n主人公「じゃあ、見てほしい所を自分でも確かめておきたいです」",
      "choices": [
        {
          "label": "返事を届ける",
          "effect": {
            "fame": 7
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        },
        {
          "label": "次の走りを磨く",
          "effect": {
            "stat": "speed",
            "value": 0.5
          },
          "reply": "直線の動作を確認し、短い練習で試した。"
        }
      ],
      "when": "any",
      "rare": true,
      "arc": "press",
      "step": 2,
      "arcName": "名前の載る記事",
      "minFame": 25,
      "minStage": 0,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "柊「人のつながりを話した記事に、応援の便りが来ています」\n柊「記事を読んで、初めて見に来たという便りです」\n主人公「次も楽しみって書いてある。うれしいけど、緊張するな」\n柊「お返事は届けられます。次の練習の話をしても、喜ばれると思いますよ」\n主人公「じゃあ、見てほしい所を自分でも確かめておきたいです」",
          "choices": [
            {
              "label": "人のつながり",
              "effect": {
                "fame": 3
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            },
            {
              "label": "次の走りを磨く",
              "effect": {
                "stat": "speed",
                "value": 0.5
              },
              "reply": "直線の動作を確認し、短い練習で試した。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "柊「走りの工夫を読んだ若手から、詳しく聞きたいと連絡が来ました」\n柊「記事を読んで、初めて見に来たという便りです」\n主人公「次も楽しみって書いてある。うれしいけど、緊張するな」\n柊「お返事は届けられます。次の練習の話をしても、喜ばれると思いますよ」\n主人公「じゃあ、見てほしい所を自分でも確かめておきたいです」",
          "choices": [
            {
              "label": "走りの工夫",
              "effect": {
                "best": 0.3
              },
              "reply": "得意な動きを説明し、同じ条件で試し直した。"
            },
            {
              "label": "返事を届ける",
              "effect": {
                "fame": 7
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_return_0",
      "speaker": "mentor",
      "title": "着順を伏せる",
      "text": "朝倉「今日は、着順を隠して見よう」\n主人公「隠しても覚えてますけどね」\n朝倉「だろうな。だが直すのは数字じゃなく動きだ。どこから見る？」\n主人公「助走か、出口か。まず一つにします」",
      "choices": [
        {
          "label": "始まりを直す",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "スタートの動作を確認し、短い練習で試した。"
        },
        {
          "label": "出口を直す",
          "effect": {
            "stat": "accel",
            "value": 0.35
          },
          "reply": "加速の動作を確認し、短い練習で試した。"
        }
      ],
      "when": "loss",
      "rare": false,
      "arc": "return",
      "step": 0,
      "arcName": "負けた日の約束",
      "minFame": 0,
      "minStage": 0,
      "theme": "連続イベント"
    },
    {
      "id": "life_return_1",
      "speaker": "mentor",
      "title": "昨日と違う一本",
      "text": "朝倉「前に決めた課題、今日の動きと並べてみろ」\n主人公「少し変わった気はします。自分だけでは自信がなくて」\n朝倉「違いはある。次に同じようにできるか、確かめよう」\n主人公「気になる所は言ってください。できたことにして終わらせたくないので」",
      "choices": [
        {
          "label": "反復する",
          "effect": {
            "worst": 0.4
          },
          "reply": "苦手な動きを一つ選び、基本から確かめた。"
        },
        {
          "label": "助言を求める",
          "effect": {
            "bond": "mentor",
            "value": 1
          },
          "reply": "気になったことを聞き、説明を最後まで確かめた。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "return",
      "step": 1,
      "arcName": "負けた日の約束",
      "minFame": 0,
      "minStage": 0,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "朝倉「最初に選んだスタートの課題だ。今日の助走と比べよう」\n朝倉「前に決めた課題、今日の動きと並べてみろ」\n主人公「少し変わった気はします。自分だけでは自信がなくて」\n朝倉「違いはある。次に同じようにできるか、確かめよう」\n主人公「気になる所は言ってください。できたことにして終わらせたくないので」",
          "choices": [
            {
              "label": "始まりを直す",
              "effect": {
                "stat": "start",
                "value": 0.35
              },
              "reply": "スタートの動作を確認し、短い練習で試した。"
            },
            {
              "label": "助言を求める",
              "effect": {
                "bond": "mentor",
                "value": 1
              },
              "reply": "気になったことを聞き、説明を最後まで確かめた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "朝倉「最初に選んだ出口の課題だ。艇を戻す所を、今日も確かめよう」\n朝倉「前に決めた課題、今日の動きと並べてみろ」\n主人公「少し変わった気はします。自分だけでは自信がなくて」\n朝倉「違いはある。次に同じようにできるか、確かめよう」\n主人公「気になる所は言ってください。できたことにして終わらせたくないので」",
          "choices": [
            {
              "label": "出口を直す",
              "effect": {
                "stat": "accel",
                "value": 0.35
              },
              "reply": "加速の動作を確認し、短い練習で試した。"
            },
            {
              "label": "反復する",
              "effect": {
                "worst": 0.4
              },
              "reply": "苦手な動きを一つ選び、基本から確かめた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_return_2",
      "speaker": "mentor",
      "title": "負けを持って進む",
      "text": "主人公「前は嫌だった映像も、今日は最後まで見られました」\n朝倉「変えた所と、残った所が分かるからだろ」\n主人公「はい。負けた映像なのは変わらないですけど」\n朝倉「それでいい。次の武器に使うか、足りない土台を直すか。どちらをやる？」",
      "choices": [
        {
          "label": "次の武器にする",
          "effect": {
            "best": 0.55
          },
          "reply": "得意な動きを説明し、同じ条件で試し直した。"
        },
        {
          "label": "崩れない土台を作る",
          "effect": {
            "stat": "power",
            "value": 0.55
          },
          "reply": "フィジカルの動作を確認し、短い練習で試した。"
        }
      ],
      "when": "any",
      "rare": true,
      "arc": "return",
      "step": 2,
      "arcName": "負けた日の約束",
      "minFame": 0,
      "minStage": 0,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "朝倉「最初に選んだスタートの課題だ。今日の助走と比べよう」\n主人公「前は嫌だった映像も、今日は最後まで見られました」\n朝倉「変えた所と、残った所が分かるからだろ」\n主人公「はい。負けた映像なのは変わらないですけど」\n朝倉「それでいい。次の武器に使うか、足りない土台を直すか。どちらをやる？」",
          "choices": [
            {
              "label": "始まりを直す",
              "effect": {
                "stat": "start",
                "value": 0.35
              },
              "reply": "スタートの動作を確認し、短い練習で試した。"
            },
            {
              "label": "崩れない土台を作る",
              "effect": {
                "stat": "power",
                "value": 0.55
              },
              "reply": "フィジカルの動作を確認し、短い練習で試した。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "朝倉「最初に選んだ出口の課題だ。艇を戻す所を、今日も確かめよう」\n主人公「前は嫌だった映像も、今日は最後まで見られました」\n朝倉「変えた所と、残った所が分かるからだろ」\n主人公「はい。負けた映像なのは変わらないですけど」\n朝倉「それでいい。次の武器に使うか、足りない土台を直すか。どちらをやる？」",
          "choices": [
            {
              "label": "出口を直す",
              "effect": {
                "stat": "accel",
                "value": 0.35
              },
              "reply": "加速の動作を確認し、短い練習で試した。"
            },
            {
              "label": "次の武器にする",
              "effect": {
                "best": 0.55
              },
              "reply": "得意な動きを説明し、同じ条件で試し直した。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_kids_0",
      "speaker": "fan",
      "title": "小さな双眼鏡",
      "text": "子供「どこを見れば、レースが分かる？」\n主人公「最初から全部見ようとすると、難しいかもな」\nなつ「時計とターン、どちらから教えようか」\n主人公「一つ覚えて、次のレースで探してみよう」",
      "choices": [
        {
          "label": "時計を教える",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "スタートの動作を確認し、短い練習で試した。"
        },
        {
          "label": "ターンを教える",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "旋回の動作を確認し、短い練習で試した。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "kids",
      "step": 0,
      "arcName": "未来のレーサー",
      "minFame": 70,
      "minStage": 0,
      "theme": "連続イベント"
    },
    {
      "id": "life_kids_1",
      "speaker": "fan",
      "title": "手描きのコース",
      "text": "子供「この前聞いた所、絵にしたよ」\n主人公「いいね。ここは、少し違うかな」\n子供「模型で見せてくれる？」\nなつ「答え合わせしてから、艇を動かしてみようか」",
      "choices": [
        {
          "label": "一緒に答え合わせ",
          "effect": {
            "fame": 4
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        },
        {
          "label": "模型で実演",
          "effect": {
            "stat": "accel",
            "value": 0.35
          },
          "reply": "加速の動作を確認し、短い練習で試した。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "kids",
      "step": 1,
      "arcName": "未来のレーサー",
      "minFame": 70,
      "minStage": 0,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "子供「この前教えてもらった時計、頂点を見るんだよね」\n子供「この前聞いた所、絵にしたよ」\n主人公「いいね。ここは、少し違うかな」\n子供「模型で見せてくれる？」\nなつ「答え合わせしてから、艇を動かしてみようか」",
          "choices": [
            {
              "label": "時計を教える",
              "effect": {
                "stat": "start",
                "value": 0.35
              },
              "reply": "スタートの動作を確認し、短い練習で試した。"
            },
            {
              "label": "模型で実演",
              "effect": {
                "stat": "accel",
                "value": 0.35
              },
              "reply": "加速の動作を確認し、短い練習で試した。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "子供「この前教えてもらったターン、曲がった後も大事なんだよね」\n子供「この前聞いた所、絵にしたよ」\n主人公「いいね。ここは、少し違うかな」\n子供「模型で見せてくれる？」\nなつ「答え合わせしてから、艇を動かしてみようか」",
          "choices": [
            {
              "label": "ターンを教える",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "旋回の動作を確認し、短い練習で試した。"
            },
            {
              "label": "一緒に答え合わせ",
              "effect": {
                "fame": 4
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_kids_2",
      "speaker": "fan",
      "title": "いつか同じ水面で",
      "text": "子供「将来、選手になる。そしたら勝負してね」\n主人公「簡単には勝たせないぞ」\nなつ「大人げないなあ。でも、楽しみだね」\n主人公「まずは基本を覚える所から。自分も、毎日そこは練習してる」",
      "choices": [
        {
          "label": "約束を交わす",
          "effect": {
            "fame": 8
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        },
        {
          "label": "基本の大切さを話す",
          "effect": {
            "worst": 0.5
          },
          "reply": "苦手な動きを一つ選び、基本から確かめた。"
        }
      ],
      "when": "any",
      "rare": true,
      "arc": "kids",
      "step": 2,
      "arcName": "未来のレーサー",
      "minFame": 70,
      "minStage": 0,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "子供「この前教えてもらった時計、頂点を見るんだよね」\n子供「将来、選手になる。そしたら勝負してね」\n主人公「簡単には勝たせないぞ」\nなつ「大人げないなあ。でも、楽しみだね」\n主人公「まずは基本を覚える所から。自分も、毎日そこは練習してる」",
          "choices": [
            {
              "label": "時計を教える",
              "effect": {
                "stat": "start",
                "value": 0.35
              },
              "reply": "スタートの動作を確認し、短い練習で試した。"
            },
            {
              "label": "基本の大切さを話す",
              "effect": {
                "worst": 0.5
              },
              "reply": "苦手な動きを一つ選び、基本から確かめた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "子供「この前教えてもらったターン、曲がった後も大事なんだよね」\n子供「将来、選手になる。そしたら勝負してね」\n主人公「簡単には勝たせないぞ」\nなつ「大人げないなあ。でも、楽しみだね」\n主人公「まずは基本を覚える所から。自分も、毎日そこは練習してる」",
          "choices": [
            {
              "label": "ターンを教える",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "旋回の動作を確認し、短い練習で試した。"
            },
            {
              "label": "約束を交わす",
              "effect": {
                "fame": 8
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_travel_0",
      "speaker": "manager",
      "title": "知らない街の朝",
      "text": "七瀬「遠征先で、少し時間が空きました」\n主人公「宿にいると、出走表ばかり見てしまいますね」\n七瀬「水辺を歩くか、街の人に挨拶するか。無理のない予定にしましょう」\n主人公「帰る道だけは、先に確認しておきます」",
      "choices": [
        {
          "label": "水辺を歩く",
          "effect": {
            "stat": "power",
            "value": 0.35
          },
          "reply": "フィジカルの動作を確認し、短い練習で試した。"
        },
        {
          "label": "街の人と話す",
          "effect": {
            "fame": 3
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "travel",
      "step": 0,
      "arcName": "遠征先の居場所",
      "minFame": 0,
      "minStage": 2,
      "theme": "連続イベント"
    },
    {
      "id": "life_travel_1",
      "speaker": "manager",
      "title": "覚えてくれた店",
      "text": "店主「また来たんだね。今日は練習帰り？」\n主人公「はい。この辺りの風、日によって変わりますね」\n店主「水辺に長くいると分かることもあるよ」\n七瀬「少し話していきますか。帰りの時間は大丈夫です」",
      "choices": [
        {
          "label": "地元の水を聞く",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "旋回の動作を確認し、短い練習で試した。"
        },
        {
          "label": "練習の話をする",
          "effect": {
            "fame": 4
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "travel",
      "step": 1,
      "arcName": "遠征先の居場所",
      "minFame": 0,
      "minStage": 2,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "七瀬「最初に歩いた水辺の道、もう迷わず通れますね」\n店主「また来たんだね。今日は練習帰り？」\n主人公「はい。この辺りの風、日によって変わりますね」\n店主「水辺に長くいると分かることもあるよ」\n七瀬「少し話していきますか。帰りの時間は大丈夫です」",
          "choices": [
            {
              "label": "水辺を歩く",
              "effect": {
                "stat": "power",
                "value": 0.35
              },
              "reply": "フィジカルの動作を確認し、短い練習で試した。"
            },
            {
              "label": "練習の話をする",
              "effect": {
                "fame": 4
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "七瀬「最初に話したお店の方が、ほかの店にも紹介してくれましたよ」\n店主「また来たんだね。今日は練習帰り？」\n主人公「はい。この辺りの風、日によって変わりますね」\n店主「水辺に長くいると分かることもあるよ」\n七瀬「少し話していきますか。帰りの時間は大丈夫です」",
          "choices": [
            {
              "label": "街の人と話す",
              "effect": {
                "fame": 3
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            },
            {
              "label": "地元の水を聞く",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "旋回の動作を確認し、短い練習で試した。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_travel_2",
      "speaker": "manager",
      "title": "帰ってこられる場所",
      "text": "店主「気をつけて。またおいで」\n主人公「お世話になりました。次もここを覚えてると思います」\n七瀬「慣れない遠征先が、一つ減りましたね」\n主人公「はい。お礼を伝えて、ここで試した走りも記録しておきます」",
      "choices": [
        {
          "label": "感謝を伝える",
          "effect": {
            "fame": 7
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        },
        {
          "label": "学んだ線を磨く",
          "effect": {
            "stat": "speed",
            "value": 0.5
          },
          "reply": "直線の動作を確認し、短い練習で試した。"
        }
      ],
      "when": "any",
      "rare": true,
      "arc": "travel",
      "step": 2,
      "arcName": "遠征先の居場所",
      "minFame": 0,
      "minStage": 2,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "七瀬「最初に歩いた水辺の道、もう迷わず通れますね」\n店主「気をつけて。またおいで」\n主人公「お世話になりました。次もここを覚えてると思います」\n七瀬「慣れない遠征先が、一つ減りましたね」\n主人公「はい。お礼を伝えて、ここで試した走りも記録しておきます」",
          "choices": [
            {
              "label": "水辺を歩く",
              "effect": {
                "stat": "power",
                "value": 0.35
              },
              "reply": "フィジカルの動作を確認し、短い練習で試した。"
            },
            {
              "label": "学んだ線を磨く",
              "effect": {
                "stat": "speed",
                "value": 0.5
              },
              "reply": "直線の動作を確認し、短い練習で試した。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "七瀬「最初に話したお店の方が、ほかの店にも紹介してくれましたよ」\n店主「気をつけて。またおいで」\n主人公「お世話になりました。次もここを覚えてると思います」\n七瀬「慣れない遠征先が、一つ減りましたね」\n主人公「はい。お礼を伝えて、ここで試した走りも記録しておきます」",
          "choices": [
            {
              "label": "街の人と話す",
              "effect": {
                "fame": 3
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            },
            {
              "label": "感謝を伝える",
              "effect": {
                "fame": 7
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_pressure_0",
      "speaker": "manager",
      "title": "期待という荷物",
      "text": "七瀬「少し静かな所へ行きましょうか」\n主人公「勝つ前提の質問が続くと、息が詰まります」\n七瀬「話して整理する時間と、体を休める時間。どちらが先に必要ですか」\n主人公「強がらずに選んでいいなら、少し助かります」",
      "choices": [
        {
          "label": "気持ちを話す",
          "effect": {
            "bond": "mentor",
            "value": 1
          },
          "reply": "気になったことを聞き、説明を最後まで確かめた。"
        },
        {
          "label": "身体を整える",
          "effect": {
            "stat": "power",
            "value": 0.35
          },
          "reply": "フィジカルの動作を確認し、短い練習で試した。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "pressure",
      "step": 0,
      "arcName": "名前の重さ",
      "minFame": 140,
      "minStage": 0,
      "theme": "連続イベント"
    },
    {
      "id": "life_pressure_1",
      "speaker": "manager",
      "title": "いつもの順番",
      "text": "七瀬「前に話したことをもとに、準備の時間を変えました」\n主人公「自分でお願いした分、何に使うか決めないと」\n七瀬「全部こなすために増やした時間ではありません。一つずつ確認しましょう」\n主人公「呼吸と、点検。今日はどちらも急がずに始めたいです」",
      "choices": [
        {
          "label": "呼吸を揃える",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "スタートの動作を確認し、短い練習で試した。"
        },
        {
          "label": "点検を揃える",
          "effect": {
            "gear": "motor",
            "value": 1.5
          },
          "reply": "モーターの状態を確認し、選んだ方法で整備した。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "pressure",
      "step": 1,
      "arcName": "名前の重さ",
      "minFame": 140,
      "minStage": 0,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "朝倉「前に緊張するって話してくれたな。今日も、隠さず話していいぞ」\n七瀬「前に話したことをもとに、準備の時間を変えました」\n主人公「自分でお願いした分、何に使うか決めないと」\n七瀬「全部こなすために増やした時間ではありません。一つずつ確認しましょう」\n主人公「呼吸と、点検。今日はどちらも急がずに始めたいです」",
          "choices": [
            {
              "label": "気持ちを話す",
              "effect": {
                "bond": "mentor",
                "value": 1
              },
              "reply": "気になったことを聞き、説明を最後まで確かめた。"
            },
            {
              "label": "点検を揃える",
              "effect": {
                "gear": "motor",
                "value": 1.5
              },
              "reply": "モーターの状態を確認し、選んだ方法で整備した。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "七瀬「前に選んだ体を整える時間は、予定の最初に残してあります」\n七瀬「前に話したことをもとに、準備の時間を変えました」\n主人公「自分でお願いした分、何に使うか決めないと」\n七瀬「全部こなすために増やした時間ではありません。一つずつ確認しましょう」\n主人公「呼吸と、点検。今日はどちらも急がずに始めたいです」",
          "choices": [
            {
              "label": "身体を整える",
              "effect": {
                "stat": "power",
                "value": 0.35
              },
              "reply": "フィジカルの動作を確認し、短い練習で試した。"
            },
            {
              "label": "呼吸を揃える",
              "effect": {
                "stat": "start",
                "value": 0.35
              },
              "reply": "スタートの動作を確認し、短い練習で試した。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_pressure_2",
      "speaker": "manager",
      "title": "背負って、ほどく",
      "text": "主人公「今日は応援を聞いても、慌てませんでした」\n七瀬「自分の準備を先に決められたからでしょうか」\n主人公「たぶん。怖さがなくなったわけじゃないですけど」\n七瀬「それでも違いがありますね。次も使う所を、残しておきましょう」",
      "choices": [
        {
          "label": "応援へ応える",
          "effect": {
            "fame": 8
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        },
        {
          "label": "自分の型を守る",
          "effect": {
            "best": 0.55
          },
          "reply": "得意な動きを説明し、同じ条件で試し直した。"
        }
      ],
      "when": "any",
      "rare": true,
      "arc": "pressure",
      "step": 2,
      "arcName": "名前の重さ",
      "minFame": 140,
      "minStage": 0,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "朝倉「前に緊張するって話してくれたな。今日も、隠さず話していいぞ」\n主人公「今日は応援を聞いても、慌てませんでした」\n七瀬「自分の準備を先に決められたからでしょうか」\n主人公「たぶん。怖さがなくなったわけじゃないですけど」\n七瀬「それでも違いがありますね。次も使う所を、残しておきましょう」",
          "choices": [
            {
              "label": "気持ちを話す",
              "effect": {
                "bond": "mentor",
                "value": 1
              },
              "reply": "気になったことを聞き、説明を最後まで確かめた。"
            },
            {
              "label": "自分の型を守る",
              "effect": {
                "best": 0.55
              },
              "reply": "得意な動きを説明し、同じ条件で試し直した。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "七瀬「前に選んだ体を整える時間は、予定の最初に残してあります」\n主人公「今日は応援を聞いても、慌てませんでした」\n七瀬「自分の準備を先に決められたからでしょうか」\n主人公「たぶん。怖さがなくなったわけじゃないですけど」\n七瀬「それでも違いがありますね。次も使う所を、残しておきましょう」",
          "choices": [
            {
              "label": "身体を整える",
              "effect": {
                "stat": "power",
                "value": 0.35
              },
              "reply": "フィジカルの動作を確認し、短い練習で試した。"
            },
            {
              "label": "応援へ応える",
              "effect": {
                "fame": 8
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_legacy_0",
      "speaker": "mentor",
      "title": "教える側の席",
      "text": "朝倉「後輩に、練習の説明を頼む」\n主人公「自分が教えていいんですか」\n朝倉「分からない所まで知ったふりをしなければいい。何から話す？」\n主人公「技術の順番か、失敗した時の話か。相手にも聞いてみます」",
      "choices": [
        {
          "label": "技術から話す",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "旋回の動作を確認し、短い練習で試した。"
        },
        {
          "label": "失敗から話す",
          "effect": {
            "fame": 4
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "legacy",
      "step": 0,
      "arcName": "次へ渡す航跡",
      "minFame": 250,
      "minStage": 6,
      "theme": "連続イベント"
    },
    {
      "id": "life_legacy_1",
      "speaker": "mentor",
      "title": "伝わらなかった一言",
      "text": "後輩「すみません。さっきの説明、ここから分からなくて」\n主人公「そうだったか。分かった顔をしてたから、先へ進めてしまった」\n朝倉「言いづらかったんだろ。今聞けた所から、やり直せばいい」\n主人公「一緒に走るか、基本から説明するか。伝わる方を探そう」",
      "choices": [
        {
          "label": "一緒に走る",
          "effect": {
            "stat": "power",
            "value": 0.35
          },
          "reply": "フィジカルの動作を確認し、短い練習で試した。"
        },
        {
          "label": "基本から話し直す",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "スタートの動作を確認し、短い練習で試した。"
        }
      ],
      "when": "any",
      "rare": false,
      "arc": "legacy",
      "step": 1,
      "arcName": "次へ渡す航跡",
      "minFame": 250,
      "minStage": 6,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "後輩「前に教わった動き、練習に入れてみました。違った所を見てもらえますか」\n後輩「すみません。さっきの説明、ここから分からなくて」\n主人公「そうだったか。分かった顔をしてたから、先へ進めてしまった」\n朝倉「言いづらかったんだろ。今聞けた所から、やり直せばいい」\n主人公「一緒に走るか、基本から説明するか。伝わる方を探そう」",
          "choices": [
            {
              "label": "技術から話す",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "旋回の動作を確認し、短い練習で試した。"
            },
            {
              "label": "基本から話し直す",
              "effect": {
                "stat": "start",
                "value": 0.35
              },
              "reply": "スタートの動作を確認し、短い練習で試した。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "後輩「前に失敗した話を聞けたので、自分が怖かった所も相談したいです」\n後輩「すみません。さっきの説明、ここから分からなくて」\n主人公「そうだったか。分かった顔をしてたから、先へ進めてしまった」\n朝倉「言いづらかったんだろ。今聞けた所から、やり直せばいい」\n主人公「一緒に走るか、基本から説明するか。伝わる方を探そう」",
          "choices": [
            {
              "label": "失敗から話す",
              "effect": {
                "fame": 4
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            },
            {
              "label": "一緒に走る",
              "effect": {
                "stat": "power",
                "value": 0.35
              },
              "reply": "フィジカルの動作を確認し、短い練習で試した。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_legacy_2",
      "speaker": "mentor",
      "title": "同じ線、違う走り",
      "text": "後輩は、教えた進路を少し変えて走った。\n主人公「今の入り方、どうして変えた？」\n後輩「自分の艇だと、その方が出口へ出やすかったので」\n朝倉「教えた通りじゃないと怒るなよ」\n主人公「怒ってません。むしろ、自分にも使えるか知りたいです」",
      "choices": [
        {
          "label": "挑戦を称える",
          "effect": {
            "fame": 10
          },
          "reply": "相手に直接話し、次に会う時の予定も伝えた。"
        },
        {
          "label": "自分も学び直す",
          "effect": {
            "worst": 0.6
          },
          "reply": "苦手な動きを一つ選び、基本から確かめた。"
        }
      ],
      "when": "any",
      "rare": true,
      "arc": "legacy",
      "step": 2,
      "arcName": "次へ渡す航跡",
      "minFame": 250,
      "minStage": 6,
      "theme": "連続イベント",
      "branches": [
        {
          "minFame": 0,
          "text": "後輩「前に教わった動き、練習に入れてみました。違った所を見てもらえますか」\n後輩は、教えた進路を少し変えて走った。\n主人公「今の入り方、どうして変えた？」\n後輩「自分の艇だと、その方が出口へ出やすかったので」\n朝倉「教えた通りじゃないと怒るなよ」\n主人公「怒ってません。むしろ、自分にも使えるか知りたいです」",
          "choices": [
            {
              "label": "技術から話す",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "旋回の動作を確認し、短い練習で試した。"
            },
            {
              "label": "自分も学び直す",
              "effect": {
                "worst": 0.6
              },
              "reply": "苦手な動きを一つ選び、基本から確かめた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "後輩「前に失敗した話を聞けたので、自分が怖かった所も相談したいです」\n後輩は、教えた進路を少し変えて走った。\n主人公「今の入り方、どうして変えた？」\n後輩「自分の艇だと、その方が出口へ出やすかったので」\n朝倉「教えた通りじゃないと怒るなよ」\n主人公「怒ってません。むしろ、自分にも使えるか知りたいです」",
          "choices": [
            {
              "label": "失敗から話す",
              "effect": {
                "fame": 4
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            },
            {
              "label": "挑戦を称える",
              "effect": {
                "fame": 10
              },
              "reply": "相手に直接話し、次に会う時の予定も伝えた。"
            }
          ]
        }
      ]
    }
  ],
  "arcs": [
    {
      "id": "banner",
      "name": "一枚の横断幕"
    },
    {
      "id": "craft",
      "name": "整備帳の余白"
    },
    {
      "id": "press",
      "name": "名前の載る記事"
    },
    {
      "id": "return",
      "name": "負けた日の約束"
    },
    {
      "id": "kids",
      "name": "未来のレーサー"
    },
    {
      "id": "travel",
      "name": "遠征先の居場所"
    },
    {
      "id": "pressure",
      "name": "名前の重さ"
    },
    {
      "id": "legacy",
      "name": "次へ渡す航跡"
    }
  ],
  "bands": [
    {
      "name": "まだ無名",
      "min": 0,
      "max": 25
    },
    {
      "name": "応援の芽",
      "min": 25,
      "max": 70
    },
    {
      "name": "地元の顔",
      "min": 70,
      "max": 140
    },
    {
      "name": "注目選手",
      "min": 140,
      "max": 250
    },
    {
      "name": "全国区",
      "min": 250,
      "max": 400
    },
    {
      "name": "看板選手",
      "min": 400,
      "max": Infinity
    }
  ]
};

root.KM_STORY_EXTRA=data;if(typeof module!=='undefined'&&module.exports)module.exports=data;
})(globalThis);



