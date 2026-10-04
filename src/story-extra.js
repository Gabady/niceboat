

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
          "label": "きれいに回ると約束する",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "「じゃあ、最初のターンに注目するよ」。その声を思い出しながら、旋回の練習へ向かった。"
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
      "text": "七瀬「受付の方が、お名前をもう一度確認したいそうです」\n主人公「さっきも聞かれましたね。まだ覚えてもらえてないか」\n七瀬「少しずつですよ。挨拶を済ませたら、練習の時間も取れます」",
      "choices": [
        {
          "label": "自己紹介を添える",
          "effect": {
            "fame": 3
          },
          "reply": "名前と次の出走予定を伝えると、担当者が出走表に丸をつけてくれた。"
        },
        {
          "label": "スタート練習に向かう",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "空いた時間で助走を繰り返した。時計と艇の位置を、一本ずつ合わせていく。"
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
          "label": "最後まで支える姿勢を練習",
          "effect": {
            "stat": "power",
            "value": 0.35
          },
          "reply": "なつの旗を桟橋に見つけ、もう一本だけ走った。腕に頼らず、腰で艇を支える。"
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
      "text": "なつ「いつもの三人が、今日の見どころを知りたいんだって」\n主人公「走り方まで気にしてくれるようになったんだな」\nなつ「ちゃんと見てるよ。どの場面に注目してもらおうか」",
      "choices": [
        {
          "label": "スタートを見て、と答える",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "大時計を指して、助走の合わせ方を説明した。話すうちに、自分の確認手順もはっきりした。"
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
          "reply": "支援を次の遠征の準備費に回した。七瀬がお礼の連絡を入れてくれた。※支援金はSG進出条件の賞金に含まれません。"
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
          "reply": "遠征の荷物を早めにまとめ、休む時間を取った。次の練習では、最後の周まで姿勢を保てた。"
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
          "reply": "取材後も、いつもの順番で身体をほぐした。肩書きが増えても、準備を変える必要はない。"
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
          "reply": "支援を受け、遠征の準備費に充てた。※支援金は進出条件の賞金に含まれません。"
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
          "reply": "「次は、ターンの後も見ててくれ」。艇を前へ向けるタイミングを、練習で確かめた。"
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
          "reply": "どこで舵を戻し、どこから加速するか。映像を止めながら説明すると、自分の得意な形が見えてきた。"
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
          "reply": "「少しだけ、準備する時間をもらえる？」。なつがうなずくのを見て、息を吐き、肩の力を抜いた。"
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
          "reply": "岸際で波が返る場所を教わった。練習で確かめると、いつもと違う進入角が必要だった。"
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
          "reply": "支援金で次の準備に余裕ができた。※支援金はSG進出条件の賞金に含まれません。"
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
          "label": "大時計へ集中する",
          "effect": {
            "stat": "start",
            "value": 0.45
          },
          "reply": "旗が上がったのを見届けてから、視線を大時計へ戻した。声援の中でも、助走の手順は崩さなかった。"
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
      "text": "主人公「こんなに人が増えても、最初に応援してくれた席は分かるな」\nなつ「今日も同じ人が座ってるよ。ほら、あの旗」\n主人公「本当だ。準備が終わったら、手を振ろう」",
      "choices": [
        {
          "label": "小さく手を振る",
          "effect": {
            "fame": 7
          },
          "reply": "昔と同じ旗が返ってきた。"
        },
        {
          "label": "終盤まで姿勢を保つ練習",
          "effect": {
            "stat": "power",
            "value": 0.45
          },
          "reply": "最後の周で腰が浮く癖を、練習で直した。あの席の前を、最後まで崩れずに走りたい。"
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
      "text": "主人公「今日は、ずいぶん横へ押されますね」\n朝倉「旗だけじゃなく、艇が流れ始める場所を見ろ」\n主人公「姿勢と舵、どちらを先に直せばいいか、一本ずつ試してみます」",
      "choices": [
        {
          "label": "身体で受ける",
          "effect": {
            "stat": "power",
            "value": 0.4
          },
          "reply": "横風に肩を持っていかれないよう、腰を落とした。腕だけで耐えるより、艇の動きがつかみやすい。"
        },
        {
          "label": "早めに旋回へ備える",
          "effect": {
            "stat": "turn",
            "value": 0.4
          },
          "reply": "風で押される分を見込み、旋回へ入る位置を手前に変えた。"
        }
      ],
      "when": "wind",
      "rare": false,
      "theme": "水面を読む",
      "branches": [
        {
          "minFame": 0,
          "text": "朝倉「見学者も少ない。今日は、風への合わせ方をじっくり試せるな」\n主人公「今日は、ずいぶん横へ押されますね」\n朝倉「旗だけじゃなく、艇が流れ始める場所を見ろ」\n主人公「姿勢と舵、どちらを先に直せばいいか、一本ずつ試してみます」"
        },
        {
          "minFame": 140,
          "text": "朝倉「見学の人がいても、派手に走ろうとするなよ。まずは風を読め」\n主人公「今日は、ずいぶん横へ押されますね」\n朝倉「旗だけじゃなく、艇が流れ始める場所を見ろ」\n主人公「姿勢と舵、どちらを先に直せばいいか、一本ずつ試してみます」",
          "choices": [
            {
              "label": "身体で受ける",
              "effect": {
                "stat": "power",
                "value": 0.4
              },
              "reply": "横風に肩を持っていかれないよう、腰を落とした。腕だけで耐えるより、艇の動きがつかみやすい。"
            },
            {
              "label": "風への対応を見学者に話す",
              "effect": {
                "fame": 5
              },
              "reply": "「旗と艇の両方を見るんです」。説明を聞いた見学者が、次の走行で視線を水面へ移した。"
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
          "reply": "握り込む力を少し抜き、腰と膝で支え直した。手元が滑っても、姿勢まで崩さずに済んだ。"
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
          "text": "篠原「まだ時間がある。濡れた時の感触も確かめておこう」\n篠原「濡れた手袋で、いつも通り握れるか？」\n主人公「少し滑ります。力を入れすぎそうだ」\n篠原「握りを確認してから出ろ。機材の点検も、雨だからと急ぐなよ」"
        },
        {
          "minFame": 140,
          "text": "篠原「カメラを待たせていても、確認は飛ばすなよ」\n篠原「濡れた手袋で、いつも通り握れるか？」\n主人公「少し滑ります。力を入れすぎそうだ」\n篠原「握りを確認してから出ろ。機材の点検も、雨だからと急ぐなよ」",
          "choices": [
            {
              "label": "握りを安定させる",
              "effect": {
                "stat": "power",
                "value": 0.4
              },
              "reply": "握り込む力を少し抜き、腰と膝で支え直した。手元が滑っても、姿勢まで崩さずに済んだ。"
            },
            {
              "label": "雨の日の準備を取材で話す",
              "effect": {
                "fame": 5
              },
              "reply": "濡れた手袋を見せながら、急いで済ませてはいけない確認を話した。記者はその場面も丁寧に撮ってくれた。"
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
          "reply": "艇を起こすのが遅れた一瞬で映像を止めた。次の練習では、そこだけを意識して回った。"
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
          "text": "朝倉「人の目は気にしなくていい。今日は、自分の課題だけ見よう」\n朝倉「負けた時の出口、もう一度見られるか」\n主人公「気分はよくないです。でも、直す場所は知りたい」\n朝倉「なら一つだけ選ぼう。次に試すことまで決めれば、今日は終わりでいい」"
        },
        {
          "minFame": 140,
          "text": "朝倉「注目された分、悔しかっただろうな。だが、着順の話は後でいい」\n朝倉「負けた時の出口、もう一度見られるか」\n主人公「気分はよくないです。でも、直す場所は知りたい」\n朝倉「なら一つだけ選ぼう。次に試すことまで決めれば、今日は終わりでいい」",
          "choices": [
            {
              "label": "出口を磨く",
              "effect": {
                "stat": "accel",
                "value": 0.45
              },
              "reply": "艇を起こすのが遅れた一瞬で映像を止めた。次の練習では、そこだけを意識して回った。"
            },
            {
              "label": "敗因と次の課題を話す",
              "effect": {
                "fame": 5
              },
              "reply": "取り繕わず、出口で遅れたことを話した。「次はそこを見るよ」と、応援していた人がうなずいた。"
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
          "reply": "うまくいった動きを、艇の位置と操作の順で書き留めた。次も再現できるよう、練習の課題に加える。"
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
          "text": "七瀬「取材は少なめです。記録も片づけも、落ち着いてできますね」\n七瀬「おめでとうございます。記録と片づけは、いつもの順番で」\n主人公「浮かれて、飛ばしそうでした」\n七瀬「喜ぶ時間も取りますよ。その前に、次も使いたいことを残しておきましょう」"
        },
        {
          "minFame": 140,
          "text": "七瀬「取材の依頼が来ています。記録を残してから、お受けしましょう」\n七瀬「おめでとうございます。記録と片づけは、いつもの順番で」\n主人公「浮かれて、飛ばしそうでした」\n七瀬「喜ぶ時間も取りますよ。その前に、次も使いたいことを残しておきましょう」",
          "choices": [
            {
              "label": "成功を記録する",
              "effect": {
                "best": 0.35
              },
              "reply": "うまくいった動きを、艇の位置と操作の順で書き留めた。次も再現できるよう、練習の課題に加える。"
            },
            {
              "label": "勝因を取材で話す",
              "effect": {
                "fame": 5
              },
              "reply": "「今日は、練習で決めた動きができました」。支えてくれた人の名前も、一緒に伝えた。"
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
          "label": "拍手に応える",
          "effect": {
            "fame": 18
          },
          "reply": "水面から上がり、スタンドへ深く頭を下げた。顔を上げると、まだ手をたたいている人がいた。"
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
          "reply": "次の準備に使うことを七瀬へ伝えた。送り主の名がなくても、応援は確かに届いていた。※支援金は進出条件の賞金に含まれません。"
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
          "reply": "紹介先で、自分の苦手な場面から相談した。教わった動きを練習帳に書き込み、朝倉にも報告する。"
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
          "reply": "延期をお願いした相手は残念そうだった。次に会える日を伝え、準備の時間を確保した。"
        },
        {
          "label": "会場手配を頼む",
          "effect": {
            "cost": 6
          },
          "reply": "使える予算を七瀬に伝え、会場の手配を任せた。残った時間で、出走の準備を進める。"
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
          "reply": "自分の言葉で訂正した。一度に全員へは届かず、離れてしまった人もいる。それでも説明は残しておこう。"
        },
        {
          "label": "説明の場を作る",
          "effect": {
            "cost": 6
          },
          "reply": "使える予算の中で説明の場を設けた。相手の疑問を聞き、一つずつ答えた。"
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
          "reply": "予算を伝え、必要な補修を篠原と相談した。作業後の状態は、出走前にもう一度確かめる。"
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
          "reply": "予算の範囲で仕上げ直しを頼んだ。残った傷の影響も確かめてから、出走に備える。"
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
          "label": "名前を大きく書く",
          "effect": {
            "fame": 3
          },
          "reply": "離れた場所から読んでもらいながら、文字の太さを決めた。なつは布を掲げて、もう一度名前を呼んだ。"
        },
        {
          "label": "走りの線を描く",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "旋回の航跡を描いてみると、出口だけ線が膨らんでいた。次の練習で、そこを確かめることにした。"
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
      "text": "なつ「できたよ。前に選んだ案、離れて見てみて」\n主人公「うん、よく見える。水面からでも見つけられそうだ」\nなつ「持ってくれる人たちにも、会ってほしいな」\n主人公「練習が終わったら行くよ。どの走りを見てほしいかも、話したい」",
      "choices": [
        {
          "label": "応援団へ挨拶する",
          "effect": {
            "fame": 4
          },
          "reply": "布の端を持つ人たちに、一人ずつお礼を言った。今度は水面からでも、顔を思い出せそうだ。"
        },
        {
          "label": "得意な走りを磨く",
          "effect": {
            "best": 0.35
          },
          "reply": "横断幕を見つけるのは、艇を上げてからでいい。まずは得意な動きを、練習でもう一本確かめた。"
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
          "text": "なつ「大きく書いた名前、初めての人にも読めるって」\n主人公「それなら、呼ばれた時にちゃんと応えたいな」\nなつ「持ってくれる人にも会う？　練習が終わってからでいいよ」",
          "choices": [
            {
              "label": "名前を呼んでくれた人に挨拶",
              "effect": {
                "fame": 3
              },
              "reply": "自分の名を呼ぶ声に手を振ると、横断幕が大きく揺れた。顔を覚えてもらう機会が、また一つ増えた。"
            },
            {
              "label": "得意な走りを磨く",
              "effect": {
                "best": 0.35
              },
              "reply": "横断幕を見つけるのは、艇を上げてからでいい。まずは得意な動きを、練習でもう一本確かめた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "なつ「描いてくれた線、あのターンだねって分かってもらえたよ」\n主人公「じゃあ、本物の走りも負けてられないな」\nなつ「持ってくれる人たちも、見るのを楽しみにしてる」",
          "choices": [
            {
              "label": "描いたターンを練習する",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "布に描いた出口の線を思い出し、艇を早く前へ向けた。絵にしたことで、直したい場所もはっきりした。"
            },
            {
              "label": "応援団へ挨拶する",
              "effect": {
                "fame": 4
              },
              "reply": "布の端を持つ人たちに、一人ずつお礼を言った。今度は水面からでも、顔を思い出せそうだ。"
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
          "label": "一緒に手直しする",
          "effect": {
            "fame": 7
          },
          "reply": "薄くなった線をなぞる間、なつがこれまでの応援の話をした。布を広げ直すと、昔の折り目だけが残っていた。"
        },
        {
          "label": "走りで応えるために鍛える",
          "effect": {
            "stat": "power",
            "value": 0.55
          },
          "reply": "最後の周で崩れないよう、姿勢を支える練習を重ねた。使い込まれた横断幕を思うと、もう一度踏ん張れた。"
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
          "text": "なつ「名前のところ、何度も畳んだから薄くなっちゃった」\n主人公「ずいぶん使ってくれたんだな。書き直してもいい？」\nなつ「もちろん。走る方の準備もあるから、無理はしないでね」",
          "choices": [
            {
              "label": "名前をなぞり直す",
              "effect": {
                "fame": 3
              },
              "reply": "なつと筆を持ち、擦れた文字に色を重ねた。次の応援で広げるのが楽しみだと、二人で笑った。"
            },
            {
              "label": "走りで応えるために鍛える",
              "effect": {
                "stat": "power",
                "value": 0.55
              },
              "reply": "最後の周で崩れないよう、姿勢を支える練習を重ねた。使い込まれた横断幕を思うと、もう一度踏ん張れた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "なつ「このターンの線も、随分薄くなったね」\n主人公「今の走りだったら、出口はもう少し内側かな」\nなつ「じゃあ描き直そうか。布も、走りと一緒に変わっていいよね」",
          "choices": [
            {
              "label": "今のターンを描き足す",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "昔の線の隣に、今の出口を描いた。練習でその違いを確かめると、舵を戻す時機がつかめた。"
            },
            {
              "label": "一緒に手直しする",
              "effect": {
                "fame": 7
              },
              "reply": "薄くなった線をなぞる間、なつがこれまでの応援の話をした。布を広げ直すと、昔の折り目だけが残っていた。"
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
          "reply": "始動直後と温まった後の音を聞き比べ、違いを最初のページに書いた。"
        },
        {
          "label": "形を記録する",
          "effect": {
            "learn": "prop",
            "value": 0.25
          },
          "reply": "プロペラの輪郭を写し、気になった縁の形に印をつけた。次の一枚と比べる場所ができた。"
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
          "reply": "曖昧なままの箇所を指すと、篠原は工具を置いて説明してくれた。分かったふりをしなくてよかった。"
        },
        {
          "label": "出口を試す",
          "effect": {
            "stat": "accel",
            "value": 0.35
          },
          "reply": "調整前と同じ進路で回り、出口の押し出しを比べた。違いを確かめるための走り方が分かってきた。"
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
          "text": "篠原「前に書いた始動音のメモ、出してみろ」\n主人公「今日は少し鈍く聞こえます。気温のせいですか？」\n篠原「いい所に気づいたな。温まってからも聞いてみよう」\n主人公「走った時の違いも、比べてみたいです」",
          "choices": [
            {
              "label": "温まった後の音を書き足す",
              "effect": {
                "learn": "motor",
                "value": 0.25
              },
              "reply": "冷えた時と温まった後の音を、同じページに並べた。篠原が言っていた回転の違いを、耳でも確かめられた。"
            },
            {
              "label": "出口を試す",
              "effect": {
                "stat": "accel",
                "value": 0.35
              },
              "reply": "調整前と同じ進路で回り、出口の押し出しを比べた。違いを確かめるための走り方が分かってきた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "篠原「前に写した輪郭と、今日の一枚を重ねてみろ」\n主人公「縁のここが違いますね。でも、走りにどう出るかは説明できません」\n篠原「違う場所が分かれば、そこから聞けるだろう」",
          "choices": [
            {
              "label": "形の違いを記録する",
              "effect": {
                "learn": "prop",
                "value": 0.25
              },
              "reply": "変わった縁だけ色を変えて描いた。どこを触ったか、次に開いても分かる記録になった。"
            },
            {
              "label": "理由を聞く",
              "effect": {
                "bond": "mechanic",
                "value": 1
              },
              "reply": "曖昧なままの箇所を指すと、篠原は工具を置いて説明してくれた。分かったふりをしなくてよかった。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_craft_2",
      "speaker": "mechanic",
      "title": "自分の整備帳",
      "text": "主人公「整備帳、もう半分使いました」\n篠原「最初のページより、随分読みやすくなったな」\n主人公「今日は、この記録を使ってみたいです。手順を見てもらえますか」\n篠原「ああ。何を確かめたいか、先に聞かせてくれ」",
      "choices": [
        {
          "label": "モーターを仕上げる",
          "effect": {
            "gear": "motor",
            "value": 3
          },
          "reply": "記録をたどってモーターを整えた。始動音を聞いた篠原が、小さくうなずいた。"
        },
        {
          "label": "プロペラを仕上げる",
          "effect": {
            "gear": "prop",
            "value": 3
          },
          "reply": "前にうまくいった輪郭を参考に、プロペラを仕上げた。理由を説明しながら、最後まで自分で手を動かした。"
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
          "text": "篠原「最初に書いた音のメモ、まだ使ってるか？」\n主人公「はい。聞き分けられる音が増えて、書き足す方が多いです」\n篠原「なら今日は耳を鍛えるか、記録を頼りに一枚仕上げるかだな」",
          "choices": [
            {
              "label": "音の記録を整理し直す",
              "effect": {
                "learn": "motor",
                "value": 0.25
              },
              "reply": "似ている音を篠原と聞き比べ、回転の状態も横に書いた。最初は「変な音」としか書けなかったページが埋まっていく。"
            },
            {
              "label": "プロペラを仕上げる",
              "effect": {
                "gear": "prop",
                "value": 3
              },
              "reply": "前にうまくいった輪郭を参考に、プロペラを仕上げた。理由を説明しながら、最後まで自分で手を動かした。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "篠原「最初に描いたプロペラ、今なら何を書き足す？」\n主人公「形だけじゃなく、乗った時の感触も。あとで見て、次の整備を決められるように」\n篠原「そうだな。記録を続けるのも、それを使って整えるのも、お前の仕事だ」",
          "choices": [
            {
              "label": "形と乗り心地を記録する",
              "effect": {
                "learn": "prop",
                "value": 0.25
              },
              "reply": "輪郭の隣に、出口で水をつかむ感触を書き加えた。図と走りが、同じページで結びついた。"
            },
            {
              "label": "モーターを仕上げる",
              "effect": {
                "gear": "motor",
                "value": 3
              },
              "reply": "記録をたどってモーターを整えた。始動音を聞いた篠原が、小さくうなずいた。"
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
          "label": "支えてくれた人の話をする",
          "effect": {
            "fame": 3
          },
          "reply": "顔を思い浮かべながら話すと、言葉が途切れなくなった。柊は走りの裏にある名前も書き留めた。"
        },
        {
          "label": "走りの工夫を話す",
          "effect": {
            "best": 0.3
          },
          "reply": "得意な場面を映像で示した。説明のために見直すと、うまくいく時の共通点が見つかった。"
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
      "text": "柊「原稿ができました。言い足りないことはありますか」\n主人公「整備のところで、篠原さんの名前を入れたいです。ターンの説明も、もう少し」\n柊「順番に伺いましょう。伝わりにくいところは、一緒に直せます」",
      "choices": [
        {
          "label": "篠原の仕事を書き添える",
          "effect": {
            "bond": "mentor",
            "value": 1
          },
          "reply": "「ここは一人で調整したわけじゃないんです」。原稿を見せると、篠原は照れたように目をそらした。"
        },
        {
          "label": "技術を補足する",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "旋回の説明を、進入・舵・出口に分けて書き直した。読み返すと、自分が曖昧にしていた動きも見えた。"
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
          "text": "柊「支えてくれた人たちの話を、原稿にまとめました」\n主人公「読むと、顔が浮かびますね。もう少し書きたいことがあります」\n柊「お聞きします。走りの説明も、必要なら補いましょう」",
          "choices": [
            {
              "label": "支えてくれた場面を追記する",
              "effect": {
                "fame": 3
              },
              "reply": "名前だけでなく、どんな時に助けてもらったかを書き足した。柊が「この場面を入れましょう」と指を止めた。"
            },
            {
              "label": "技術を補足する",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "旋回の説明を、進入・舵・出口に分けて書き直した。読み返すと、自分が曖昧にしていた動きも見えた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "柊「走りの工夫を中心に、原稿を組みました」\n主人公「ここ、操作の順番が少し違います。整備は篠原さんに相談していたことも入れたいです」\n柊「では、どちらから詳しく伺いましょうか」",
          "choices": [
            {
              "label": "得意な動きの説明を直す",
              "effect": {
                "best": 0.3
              },
              "reply": "操作の順に文を並べ直した。映像と見比べるうち、得意な走りの要点を短く言えるようになった。"
            },
            {
              "label": "篠原の仕事を書き添える",
              "effect": {
                "bond": "mentor",
                "value": 1
              },
              "reply": "「ここは一人で調整したわけじゃないんです」。原稿を見せると、篠原は照れたように目をそらした。"
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
          "reply": "「見つけてくださって、ありがとうございます」。書き出しを何度か迷ってから、次の出走予定も添えた。"
        },
        {
          "label": "次の走りを磨く",
          "effect": {
            "stat": "speed",
            "value": 0.5
          },
          "reply": "直線で余計に舵を動かしていた箇所を直した。次に見に来た人へ、前より伸びる一本を見せたい。"
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
          "text": "柊「支えてくれた人の話を読んで、初めてレースを見たそうです」\n主人公「記事で名前を出した人にも、知らせたいな」\n柊「お返事はお預かりします。次の走りを楽しみにしているとも書かれていますよ」",
          "choices": [
            {
              "label": "便りを支援者にも見せる",
              "effect": {
                "fame": 3
              },
              "reply": "記事に登場した人たちと便りを読んだ。「今度は一緒に見ようか」と、応援の輪に新しい話が生まれた。"
            },
            {
              "label": "次の走りを磨く",
              "effect": {
                "stat": "speed",
                "value": 0.5
              },
              "reply": "直線で余計に舵を動かしていた箇所を直した。次に見に来た人へ、前より伸びる一本を見せたい。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "柊「走りの工夫を読んだ若手から、もっと聞きたいと便りが届きました」\n主人公「説明したところを、実際に見てくれたんですね」\n柊「お返事でも、次の取材での解説でも。伝えられる方法を選びましょう」",
          "choices": [
            {
              "label": "得意な走りをもう一度解説",
              "effect": {
                "best": 0.3
              },
              "reply": "見やすい映像を選び、操作の理由を添えた。教えるつもりが、自分の得意な形を確かめる時間にもなった。"
            },
            {
              "label": "返事を届ける",
              "effect": {
                "fame": 7
              },
              "reply": "「見つけてくださって、ありがとうございます」。書き出しを何度か迷ってから、次の出走予定も添えた。"
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
          "label": "助走を見直す",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "針と艇の位置がずれたところで映像を止めた。次の助走では、そこに入る速さを変えてみる。"
        },
        {
          "label": "ターン出口を見直す",
          "effect": {
            "stat": "accel",
            "value": 0.35
          },
          "reply": "出口で艇を起こすタイミングに印をつけた。遅れを取り戻そうと急ぐ前に、最初の操作を直したい。"
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
          "reply": "まだ崩れる動きだけに絞り、同じ練習を繰り返した。できた一本と比べると、違いが分かる。"
        },
        {
          "label": "助言を求める",
          "effect": {
            "bond": "mentor",
            "value": 1
          },
          "reply": "「今の一本、どうでしたか」。自分から聞くと、朝倉は良くなった所と残った癖を分けて話してくれた。"
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
          "text": "朝倉「前に選んだ助走の課題だ。今日の映像と並べてみろ」\n主人公「同じ場所でも、針の位置が違いますね」\n朝倉「変えたことが、走りにも出てる。もう一本試すか、気になる所から話すか？」",
          "choices": [
            {
              "label": "助走のタイミングを合わせる",
              "effect": {
                "stat": "start",
                "value": 0.35
              },
              "reply": "目印を通る時の針の位置をそろえた。前の映像との違いを、次の一本でも再現できた。"
            },
            {
              "label": "助言を求める",
              "effect": {
                "bond": "mentor",
                "value": 1
              },
              "reply": "「今の一本、どうでしたか」。自分から聞くと、朝倉は良くなった所と残った癖を分けて話してくれた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "朝倉「前に選んだ出口の課題だ。艇を起こす所を見ろ」\n主人公「少し早く戻せています。でも、毎回できるわけじゃなくて」\n朝倉「なら、うまくいく時と崩れる時を比べよう」",
          "choices": [
            {
              "label": "艇を起こす時機をそろえる",
              "effect": {
                "stat": "accel",
                "value": 0.35
              },
              "reply": "出口で焦ってレバーを戻さず、艇が前を向くのを感じ取った。一本ごとの加速のばらつきが減った。"
            },
            {
              "label": "苦手な動きを反復する",
              "effect": {
                "worst": 0.4
              },
              "reply": "まだ崩れる動きだけに絞り、同じ練習を繰り返した。できた一本と比べると、違いが分かる。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_return_2",
      "speaker": "mentor",
      "title": "負けを持って進む",
      "text": "主人公「前は見たくなかった映像も、今日は最後まで見られました」\n朝倉「今の走りと比べられるようになったからだろ」\n主人公「はい。負けたことは変わらないけど、同じ失敗は減らせそうです」\n朝倉「じゃあ、この先に使う練習を決めよう」",
      "choices": [
        {
          "label": "次の武器にする",
          "effect": {
            "best": 0.55
          },
          "reply": "得意な場面へ持ち込むまでに何が必要か、朝倉と整理した。負けた映像も、作戦を立てる材料になる。"
        },
        {
          "label": "崩れない土台を作る",
          "effect": {
            "stat": "power",
            "value": 0.55
          },
          "reply": "崩れた場面と同じ姿勢を陸で取り、支えが抜ける場所を確かめた。苦しい時ほど戻れる姿勢を覚えておく。"
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
          "text": "主人公「前は見たくなかった助走の映像、今なら最後まで見られます」\n朝倉「同じ目印でも、今のお前は違う動きができるからな」\n主人公「もう一度合わせてみたいです。あとは、終盤に姿勢が崩れるところも」",
          "choices": [
            {
              "label": "今の助走を確かめる",
              "effect": {
                "stat": "start",
                "value": 0.35
              },
              "reply": "昔の映像と同じ目印で、針の位置を確かめた。修正を重ねた助走が、ようやく自分の手順になってきた。"
            },
            {
              "label": "崩れない土台を作る",
              "effect": {
                "stat": "power",
                "value": 0.55
              },
              "reply": "崩れた場面と同じ姿勢を陸で取り、支えが抜ける場所を確かめた。苦しい時ほど戻れる姿勢を覚えておく。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "主人公「この時は、出口で慌てるほど加速が鈍ってました」\n朝倉「今は、その前に直す所が分かるだろう」\n主人公「はい。この走りを、次の勝負にも使いたいです」",
          "choices": [
            {
              "label": "今の出口を確かめる",
              "effect": {
                "stat": "accel",
                "value": 0.35
              },
              "reply": "艇が前を向くまでの操作を、一本ずつそろえた。負けた時の焦りより、今日の艇の感触を頼りにできた。"
            },
            {
              "label": "次の武器にする",
              "effect": {
                "best": 0.55
              },
              "reply": "得意な場面へ持ち込むまでに何が必要か、朝倉と整理した。負けた映像も、作戦を立てる材料になる。"
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
          "label": "大時計の見方を教える",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "時計とスタートラインを指しながら説明した。子供に伝わる順番で話すと、自分の助走の確認も整理できた。"
        },
        {
          "label": "ターンの見方を教える",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "模型の艇を動かして、入口と出口を示した。簡単な言葉にするために、自分も操作を一つずつ思い返した。"
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
          "reply": "絵を指しながら聞くと、子供は見てきたレースを夢中で話した。次は友達も誘ってくるらしい。"
        },
        {
          "label": "模型で実演",
          "effect": {
            "stat": "accel",
            "value": 0.35
          },
          "reply": "模型を出口でまっすぐ向け、加速へ移るところを見せた。説明しながら、自分の切り替えの遅れにも気づいた。"
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
          "text": "子供「この前の時計、絵に描いてきた。針がここに来たらスタート？」\n主人公「そう。艇はその前から走っていて、合図に合わせてこの線を通るんだ」\nなつ「模型もあるよ。動かして見せてもらおうか」",
          "choices": [
            {
              "label": "艇と時計の合わせ方を教える",
              "effect": {
                "stat": "start",
                "value": 0.35
              },
              "reply": "針を動かす子供に合わせて模型を進めた。速さと距離の説明は、自分の助走を見直すことにもなった。"
            },
            {
              "label": "模型で実演する",
              "effect": {
                "stat": "accel",
                "value": 0.35
              },
              "reply": "模型を出口でまっすぐ向け、加速へ移るところを見せた。説明しながら、自分の切り替えの遅れにも気づいた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "子供「この前のターン、絵にしてきた。曲がった後は、まっすぐでいい？」\n主人公「そうだね。ただ、ここで早く前を向けると、その先の速さも変わるんだ」\nなつ「見たレースと比べながら、答え合わせしようか」",
          "choices": [
            {
              "label": "入口と出口の違いを教える",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "進入の線を少しずらし、出口がどう変わるか模型で示した。自分の旋回にも試したい形が見つかった。"
            },
            {
              "label": "一緒に答え合わせ",
              "effect": {
                "fame": 4
              },
              "reply": "絵を指しながら聞くと、子供は見てきたレースを夢中で話した。次は友達も誘ってくるらしい。"
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
          "reply": "「楽しみにしてる。こっちも練習して待ってるよ」。子供は大きくうなずき、なつの方まで走っていった。"
        },
        {
          "label": "基本の大切さを話す",
          "effect": {
            "worst": 0.5
          },
          "reply": "分からない所を聞くことと、できない動きを繰り返すこと。話し終えると、自分も苦手な練習を後回しにできなくなった。"
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
          "text": "子供「選手になったら、あの時計に合わせて走るんだよね」\n主人公「そうだよ。最初は慌てるけど、準備の順番を覚えていくんだ」\n子供「じゃあ、今日は何を練習してるか教えて」",
          "choices": [
            {
              "label": "自分の助走の練習を話す",
              "effect": {
                "stat": "start",
                "value": 0.35
              },
              "reply": "目印を決め、同じ場所で針を見る。基本を話してから練習すると、自分の手順の抜けも見つけられた。"
            },
            {
              "label": "基本の大切さを話す",
              "effect": {
                "worst": 0.5
              },
              "reply": "分からない所を聞くことと、できない動きを繰り返すこと。話し終えると、自分も苦手な練習を後回しにできなくなった。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "子供「選手になったら、あのターンで勝負したい」\n主人公「簡単には勝たせないぞ。出口まで、ちゃんと練習しておかないとな」\nなつ「二人とも本気だね。いつか同じ水面で見られたらいいな」",
          "choices": [
            {
              "label": "ターンの続きを教える",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "前に見せた模型を使い、今度は出口まで動かした。説明の後、自分の旋回でも舵を戻す位置を確かめた。"
            },
            {
              "label": "勝負の約束を交わす",
              "effect": {
                "fame": 8
              },
              "reply": "「楽しみにしてる。こっちも練習して待ってるよ」。子供は大きくうなずき、なつの方まで走っていった。"
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
          "reply": "水辺の道を、呼吸が乱れない速さで歩いた。宿へ戻る頃には、座りっぱなしで固まった腰もほぐれていた。"
        },
        {
          "label": "街の人と話す",
          "effect": {
            "fame": 3
          },
          "reply": "道を尋ねた店先で、次の出走の話になった。「見てみるよ」と、店主が店の奥へ声をかけた。"
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
          "label": "地元の水面について聞く",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "風が回り込む岸辺を教わった。練習でその場所を通り、旋回中の艇の流れ方を確かめた。"
        },
        {
          "label": "練習の話をする",
          "effect": {
            "fame": 4
          },
          "reply": "うまく回れなかった話をすると、店主は笑って聞いてくれた。帰り際、次の出走表を置く場所を空けてくれた。"
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
          "text": "七瀬「前に歩いた道ですね。今日は迷わず戻れそうです」\n店主「練習帰りかい？　少し休んでいく？」\n主人公「ありがとうございます。歩くと、身体も楽になるんです」",
          "choices": [
            {
              "label": "水辺を歩いて身体をほぐす",
              "effect": {
                "stat": "power",
                "value": 0.35
              },
              "reply": "教えてもらった道を遠回りし、肩を回しながら歩いた。風に当たるうち、レース後の力みが抜けた。"
            },
            {
              "label": "練習の話をする",
              "effect": {
                "fame": 4
              },
              "reply": "うまく回れなかった話をすると、店主は笑って聞いてくれた。帰り際、次の出走表を置く場所を空けてくれた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "店主「また来たね。隣の店の人も、レースを見たって言ってたよ」\n主人公「話してくれたんですか。ありがとうございます」\n七瀬「少し時間があります。水面の話も聞いていきますか」",
          "choices": [
            {
              "label": "街の人に近況を話す",
              "effect": {
                "fame": 3
              },
              "reply": "紹介された店にも顔を出し、次の出走を伝えた。慣れない街で呼び止めてくれる人が増えた。"
            },
            {
              "label": "地元の水面について聞く",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "風が回り込む岸辺を教わった。練習でその場所を通り、旋回中の艇の流れ方を確かめた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_travel_2",
      "speaker": "manager",
      "title": "帰ってこられる場所",
      "text": "店主「気をつけて。またおいで」\n主人公「お世話になりました。次に来た時も寄ります」\n七瀬「遠征先に、挨拶できる場所ができましたね」\n主人公「はい。ここで教わったことも、忘れず持って帰ります」",
      "choices": [
        {
          "label": "感謝を伝える",
          "effect": {
            "fame": 7
          },
          "reply": "店主と握手し、次の開催の話をした。旅先でかけてもらった言葉を、帰りの道でも思い出していた。"
        },
        {
          "label": "学んだ線を磨く",
          "effect": {
            "stat": "speed",
            "value": 0.5
          },
          "reply": "水面の癖を記録に残し、直線で艇を安定させる姿勢を練習した。次の遠征でも、まず自分で確かめたい。"
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
          "text": "七瀬「帰る前に、あの水辺を少し歩きますか」\n主人公「そうしましょう。最初は道を間違えたのに、今は案内できますね」\n七瀬「覚えたのは道だけではなさそうです。走りの記録も、持ち帰りましょう」",
          "choices": [
            {
              "label": "歩いて旅の疲れをほぐす",
              "effect": {
                "stat": "power",
                "value": 0.35
              },
              "reply": "見慣れた道をゆっくり歩き、荷物を持つ前に身体をほぐした。遠征の終わりにも、自分の調子を確かめられた。"
            },
            {
              "label": "学んだ走りを磨く",
              "effect": {
                "stat": "speed",
                "value": 0.5
              },
              "reply": "水面の癖を記録に残し、直線で艇を安定させる姿勢を練習した。次の遠征でも、まず自分で確かめたい。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "店主「次も顔を出してよ。近所のみんなにも伝えておくから」\n主人公「はい。教えてもらった店、まだ全部は回れてないですし」\n七瀬「次の遠征にも、楽しみができましたね」",
          "choices": [
            {
              "label": "街の人に帰りの挨拶をする",
              "effect": {
                "fame": 3
              },
              "reply": "世話になった店へ順に顔を出した。別れの挨拶のはずが、次に来た時の話になった。"
            },
            {
              "label": "感謝を伝える",
              "effect": {
                "fame": 7
              },
              "reply": "店主と握手し、次の開催の話をした。旅先でかけてもらった言葉を、帰りの道でも思い出していた。"
            }
          ]
        }
      ]
    },
    {
      "id": "life_pressure_0",
      "speaker": "manager",
      "title": "期待という荷物",
      "text": "七瀬「少し静かな所へ行きましょうか」\n主人公「勝つ前提の質問が続くと、息が詰まります」\n七瀬「朝倉さんに話を聞いてもらう時間も取れます。今日は、先に休みますか？」\n主人公「そう言ってもらえるだけでも、少し楽です」",
      "choices": [
        {
          "label": "朝倉に気持ちを話す",
          "effect": {
            "bond": "mentor",
            "value": 1
          },
          "reply": "朝倉は急いで励まさず、話が終わるまで聞いてくれた。「次も、苦しくなる前に言えよ」。その一言にうなずいた。"
        },
        {
          "label": "身体を整える",
          "effect": {
            "stat": "power",
            "value": 0.35
          },
          "reply": "静かな場所で呼吸を整え、肩と腰をゆっくり伸ばした。力が入りっぱなしだったことに、ようやく気づいた。"
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
      "text": "七瀬「準備の前に、余裕を持てる時間を作りました」\n主人公「空いた分、何か詰めないといけない気がして」\n七瀬「埋めるための時間ではありませんよ。いつもの準備を、急がずにできれば十分です」\n主人公「分かりました。呼吸を整えて、一つずつ点検します」",
      "choices": [
        {
          "label": "助走前の呼吸を整える",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "大時計を見る前に、一度息を吐く。助走でも試すと、針を追う視線が落ち着いた。"
        },
        {
          "label": "点検の順番を確かめる",
          "effect": {
            "gear": "motor",
            "value": 1.5
          },
          "reply": "モーターの確認箇所を指で追い、順番に点検した。急がない分、回転の小さなばらつきにも気づけた。"
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
          "text": "朝倉「前に話した緊張のこと、今日はどうだ？」\n主人公「まだあります。でも、隠さなくていいのは楽です」\n七瀬「話す時間も、準備の時間も取ってあります。焦らず始めましょう」",
          "choices": [
            {
              "label": "今の不安を朝倉に話す",
              "effect": {
                "bond": "mentor",
                "value": 1
              },
              "reply": "前より短い言葉で、不安な場面を伝えられた。朝倉もその場面に絞って、一緒に準備を考えてくれた。"
            },
            {
              "label": "点検の順番を確かめる",
              "effect": {
                "gear": "motor",
                "value": 1.5
              },
              "reply": "モーターの確認箇所を指で追い、順番に点検した。急がない分、回転の小さなばらつきにも気づけた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "七瀬「前と同じように、身体を整える時間を先に取ってあります」\n主人公「ありがとうございます。急いで支度すると、肩まで固くなるんです」\n七瀬「では、ほぐしてから。呼吸が落ち着くまで待って大丈夫ですよ」",
          "choices": [
            {
              "label": "肩と腰をほぐす",
              "effect": {
                "stat": "power",
                "value": 0.35
              },
              "reply": "固くなりやすい所を順に伸ばした。艇に乗る前から、自分の姿勢を確かめる余裕ができた。"
            },
            {
              "label": "助走前の呼吸を整える",
              "effect": {
                "stat": "start",
                "value": 0.35
              },
              "reply": "大時計を見る前に、一度息を吐く。助走でも試すと、針を追う視線が落ち着いた。"
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
          "label": "応援に応える",
          "effect": {
            "fame": 8
          },
          "reply": "準備を終えてから、スタンドへ手を振った。声に応えても、自分の手順まで急ぐ必要はなかった。"
        },
        {
          "label": "自分の型を守る",
          "effect": {
            "best": 0.55
          },
          "reply": "周りの期待ではなく、練習で確かめた動きを選んだ。得意な形へ入るまでの手順を、もう一度繰り返す。"
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
          "text": "主人公「今日は、応援を聞いても準備を急がずに済みました」\n朝倉「前に話した時と、何が違った？」\n主人公「何が怖いか、自分でも分かっていたからかもしれません」\n朝倉「その違いは覚えておけ。次も使えるぞ」",
          "choices": [
            {
              "label": "変わったことを朝倉に話す",
              "effect": {
                "bond": "mentor",
                "value": 1
              },
              "reply": "怖さがなくなったわけではないと伝えた。朝倉は「それでも準備できたんだろ」と笑い、話の続きを待ってくれた。"
            },
            {
              "label": "自分の型を守る",
              "effect": {
                "best": 0.55
              },
              "reply": "周りの期待ではなく、練習で確かめた動きを選んだ。得意な形へ入るまでの手順を、もう一度繰り返す。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "主人公「身体をほぐす時間を取ると、声援を聞く余裕もできるんですね」\n七瀬「以前は、その時間まで予定で埋めてしまっていましたね」\n主人公「これからも残したいです。終わったら、自分から挨拶に行けるので」",
          "choices": [
            {
              "label": "いつもの準備を繰り返す",
              "effect": {
                "stat": "power",
                "value": 0.35
              },
              "reply": "肩、腰、呼吸。慣れた順番をたどると、艇を支える姿勢へ自然に戻れた。"
            },
            {
              "label": "応援に応える",
              "effect": {
                "fame": 8
              },
              "reply": "準備を終えてから、スタンドへ手を振った。声に応えても、自分の手順まで急ぐ必要はなかった。"
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
          "label": "旋回の技術から話す",
          "effect": {
            "stat": "turn",
            "value": 0.35
          },
          "reply": "自分が見ている目印から説明した。言葉が詰まる所は、理解が曖昧な所でもある。帰りにその動きを練習し直した。"
        },
        {
          "label": "失敗から話す",
          "effect": {
            "fame": 4
          },
          "reply": "初めて失敗した時のことを話すと、後輩も顔を上げた。「自分も、それが怖かったんです」と声が返ってきた。"
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
      "text": "後輩「すみません。さっきの説明、ここから分からなくて」\n主人公「そうだったか。先へ進めすぎたな」\n朝倉「今、聞いてくれてよかったじゃないか」\n主人公「うん。実際に走って見せるか、順番から話すか。分かりやすい方を探そう」",
      "choices": [
        {
          "label": "一緒に走る",
          "effect": {
            "stat": "power",
            "value": 0.35
          },
          "reply": "手本を見せようとすると、姿勢の癖まで隠せない。後輩と一緒に、最後まで支えを崩さず走る練習をした。"
        },
        {
          "label": "助走の基本から話し直す",
          "effect": {
            "stat": "start",
            "value": 0.35
          },
          "reply": "時計を見る場所と、艇を進める順番から説明し直した。自分が省いていた確認にも気づいた。"
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
          "text": "後輩「前に教わった旋回、真似してみたんですが、ここから先が分からなくて」\n主人公「出口まで一度に話しすぎたか。まず、どこで迷ったか教えて」\n朝倉「質問できるようになったなら、前には進んでるぞ」",
          "choices": [
            {
              "label": "旋回を一動作ずつ説明する",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "模型を途中で止めながら、重心を移す順を話した。教えている自分も、早すぎた操作を見直せた。"
            },
            {
              "label": "助走の基本から話し直す",
              "effect": {
                "stat": "start",
                "value": 0.35
              },
              "reply": "時計を見る場所と、艇を進める順番から説明し直した。自分が省いていた確認にも気づいた。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "後輩「前に失敗の話をしてくれたので、自分も聞きたくて。波に乗るのが怖いんです」\n主人公「分かるよ。自分も、身体が固まってしまう時があった」\n朝倉「話だけで分かりにくければ、一緒に確かめてこい」",
          "choices": [
            {
              "label": "怖かった時の話をする",
              "effect": {
                "fame": 4
              },
              "reply": "克服できた話だけでなく、まだ迷うことも伝えた。後輩はうなずき、次に練習したい場面を自分から話した。"
            },
            {
              "label": "一緒に走る",
              "effect": {
                "stat": "power",
                "value": 0.35
              },
              "reply": "手本を見せようとすると、姿勢の癖まで隠せない。後輩と一緒に、最後まで支えを崩さず走る練習をした。"
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
          "reply": "「その変え方、よかったな」。理由まで聞くと、後輩はうれしそうに次の工夫も話し始めた。"
        },
        {
          "label": "自分も学び直す",
          "effect": {
            "worst": 0.6
          },
          "reply": "自分の苦手な進入で、後輩の工夫を試した。教えた相手から、今度は自分が教わっている。"
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
          "text": "後輩は、教わった旋回の進路を少し変えて走った。\n主人公「出口が近くなったな。どうして、その入り方にした？」\n後輩「自分の艇だと、こちらの方が戻しやすかったので」\n朝倉「お前も試してみればいい。教えた通りが、いつも正解じゃないぞ」",
          "choices": [
            {
              "label": "旋回の違いを一緒に比べる",
              "effect": {
                "stat": "turn",
                "value": 0.35
              },
              "reply": "互いの走行線を重ね、艇を戻しやすい位置を探した。説明するだけの時間が、二人で工夫する時間に変わった。"
            },
            {
              "label": "自分も学び直す",
              "effect": {
                "worst": 0.6
              },
              "reply": "自分の苦手な進入で、後輩の工夫を試した。教えた相手から、今度は自分が教わっている。"
            }
          ]
        },
        {
          "minFame": 0,
          "text": "後輩「前に話した、怖くて固まる所。今日は進路を変えてみたんです」\n主人公「今の走り、そういう理由だったのか」\n朝倉「怖いと言えるようになって、自分で対策まで考えたわけだ」\n主人公「うん。最初に話してくれて、よかった」",
          "choices": [
            {
              "label": "自分の失敗と比べて話す",
              "effect": {
                "fame": 4
              },
              "reply": "似た失敗でも、選ぶ対策は同じとは限らない。互いの話を聞くうち、後輩の表情から遠慮が消えていった。"
            },
            {
              "label": "挑戦を称える",
              "effect": {
                "fame": 10
              },
              "reply": "「その変え方、よかったな」。理由まで聞くと、後輩はうれしそうに次の工夫も話し始めた。"
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


