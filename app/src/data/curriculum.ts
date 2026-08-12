import type { Unit } from "@/types";

/** 2022 개정 교육과정 중학교 정보과 성취기준 기반 코스웨어 콘텐츠 */
export const curriculum: Unit[] = [
  {
    id: "unit-1",
    number: 1,
    title: "컴퓨팅 시스템",
    color: "#0B6E4F",
    accent: "#08A045",
    description:
      "컴퓨팅 시스템의 구성과 동작 원리, 운영체제, 피지컬 컴퓨팅을 탐구합니다.",
    standards: ["[9정01-01]", "[9정01-02]", "[9정01-03]"],
    subunits: [
      {
        id: "u1-s1",
        title: "컴퓨팅 시스템과 운영체제",
        description: "하드웨어·소프트웨어·운영체제의 역할과 상호작용",
        lessons: [
          {
            id: "u1-s1-l1",
            unitId: "unit-1",
            subunitId: "u1-s1",
            title: "컴퓨팅 시스템의 구성요소와 동작 원리",
            standards: ["[9정01-01]"],
            objectives: [
              "컴퓨팅 시스템의 입력·처리·출력·저장 흐름을 설명할 수 있다.",
              "CPU, 메모리, 저장장치, 입출력장치의 역할을 구분할 수 있다.",
              "운영체제가 자원을 관리하는 이유를 설명할 수 있다.",
            ],
            youtubeId: "AkFi90lZmXA",
            youtubeTitle: "컴퓨터는 어떻게 동작할까? (하드웨어 개요)",
            intro: {
              title: "도입 — 내 손안의 컴퓨터는 어떻게 움직일까?",
              content: [
                "스마트폰으로 사진을 찍고 SNS에 올리는 순간, 수많은 장치가 협력합니다.",
                "카메라(입력) → 프로세서(처리) → 화면·네트워크(출력) → 저장소(저장)의 흐름을 떠올려 봅시다.",
                "오늘은 ‘컴퓨터’를 특정 기기가 아닌, 문제를 해결하는 시스템으로 확장해 이해합니다.",
              ],
              activities: [
                "모둠별로 교실에 있는 컴퓨팅 시스템(전자출결, 스마트보드, 로봇청소기 등)을 3개 이상 찾아 적기",
              ],
            },
            development: {
              title: "전개 — 구성 요소와 운영체제",
              content: [
                "1) 하드웨어: CPU(연산·제어), RAM(임시 기억), SSD/HDD(영구 저장), GPU(그래픽·병렬연산), 메인보드(연결), 전원부.",
                "2) 소프트웨어: 시스템 소프트웨어(운영체제, 드라이버)와 응용 소프트웨어(브라우저, 문서, 게임).",
                "3) 동작 원리: 폰 노이만 구조 — 프로그램과 데이터를 메모리에 올려 CPU가 명령어를 순차 실행.",
                "4) 운영체제(OS): 프로세스 관리, 메모리 관리, 파일 시스템, 장치 관리, 사용자 인터페이스 제공.",
                "5) 멀티태스킹: CPU 시간을 짧게 나누어 여러 프로그램이 동시에 일하는 것처럼 보이게 함.",
                "6) 실습 포인트: 아래 3D 모델에서 각 부품을 클릭하며 ‘없으면 어떤 문제가 생기는지’ 생각해 보기.",
              ],
              activities: [
                "3D PC 모델에서 CPU·RAM·저장장치·전원부를 클릭하고 역할 메모하기",
                "작업 관리자(또는 활동 모니터)에서 실행 중인 프로세스·메모리 사용량 관찰하기",
              ],
            },
            summary: {
              title: "정리 — 시스템으로 바라보기",
              content: [
                "컴퓨팅 시스템은 하드웨어와 소프트웨어가 협력하여 입력을 처리하고 결과를 내는 전체입니다.",
                "운영체제는 자원을 공정하고 효율적으로 나누어 주는 ‘교통정리원’입니다.",
                "다음 시간에는 센서·액추에이터가 결합된 피지컬 컴퓨팅을 살펴봅니다.",
              ],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "RAM과 SSD의 역할 차이를 한 문장으로 쓰시오.",
                sampleAnswer: "RAM은 실행 중 데이터를 임시 저장하고, SSD는 데이터를 영구 저장한다.",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "운영체제가 없다면 어떤 불편이 생길지, CPU·메모리·파일·장치 관리 중 두 가지 이상을 들어 서술하시오.",
                rubric:
                  "운영체제 기능(프로세스/메모리/파일/장치) 중 2개 이상 연결, 구체적 사례, 논리적 서술",
              },
            ],
            specialFeature: "pc-3d",
          },
        ],
      },
      {
        id: "u1-s2",
        title: "피지컬 컴퓨팅 시스템",
        description: "센서·액추에이터와 실생활 적용 사례",
        lessons: [
          {
            id: "u1-s2-l1",
            unitId: "unit-1",
            subunitId: "u1-s2",
            title: "피지컬 컴퓨팅의 개념과 생활 속 사례",
            standards: ["[9정01-02]"],
            objectives: [
              "피지컬 컴퓨팅의 개념을 설명할 수 있다.",
              "센서·마이크로컨트롤러·액추에이터의 역할을 구분할 수 있다.",
              "생활 속 사례를 통해 필요성과 가치를 판단할 수 있다.",
            ],
            youtubeId: "nKRVmxlR5n0",
            youtubeTitle: "피지컬 컴퓨팅이란? (아두이노·센서 소개)",
            intro: {
              title: "도입 — 세상이 컴퓨터와 대화한다면?",
              content: [
                "자동문이 사람을 감지해 열리고, 스마트 화분이 흙이 마르면 물을 줍니다.",
                "물리 세계를 감지하고 반응하는 시스템을 피지컬 컴퓨팅이라고 합니다.",
              ],
            },
            development: {
              title: "전개 — 구성과 사례 분석",
              content: [
                "구성: 센서(입력) → 마이크로컨트롤러(처리) → 액추에이터/통신(출력).",
                "대표 센서: 온도, 조도, 초음파, 가속도, 터치, 카메라.",
                "대표 액추에이터: LED, 모터, 버저, 서보, 디스플레이.",
                "사례: 스마트홈(온습도·조명), 교통(신호·주차), 헬스케어(웨어러블), 농업(스마트팜).",
                "가치: 안전, 편의, 에너지 절약, 접근성 향상. 동시에 프라이버시·오작동 위험도 검토해야 함.",
              ],
              activities: [
                "생활 속 피지컬 컴퓨팅 사례 3개를 찾아 ‘센서-처리-출력’으로 분해하기",
                "우리 학교 문제를 해결하는 피지컬 아이디어 1개 제안하기",
              ],
            },
            summary: {
              title: "정리",
              content: [
                "피지컬 컴퓨팅은 하드웨어와 소프트웨어를 결합해 현실 문제에 반응하는 시스템입니다.",
                "필요성과 가치를 판단할 때는 편리함뿐 아니라 윤리·안전도 함께 봅니다.",
              ],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "피지컬 컴퓨팅 시스템의 기본 흐름을 세 단계로 쓰시오.",
                sampleAnswer: "센서 입력 → 마이크로컨트롤러 처리 → 액추에이터 출력",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "스마트 교실에 필요한 피지컬 컴퓨팅 시스템을 하나 제안하고, 필요성과 가치를 근거와 함께 서술하시오.",
                rubric: "센서/처리/출력 명시, 필요성·가치 판단, 구체적 근거",
              },
            ],
          },
        ],
      },
      {
        id: "u1-s3",
        title: "피지컬 컴퓨팅 시스템 구현",
        description: "목적에 맞는 구성 요소 선택과 시스템 구상",
        lessons: [
          {
            id: "u1-s3-l1",
            unitId: "unit-1",
            subunitId: "u1-s3",
            title: "목적에 맞는 피지컬 시스템 구상하기",
            standards: ["[9정01-03]"],
            objectives: [
              "문제 해결 목적에 맞는 센서·액추에이터를 선택할 수 있다.",
              "입출력과 제어 흐름을 포함한 시스템 구상도를 그릴 수 있다.",
            ],
            youtubeId: "fGjk1l-F8Yg",
            youtubeTitle: "아두이노로 LED와 센서 제어하기",
            intro: {
              title: "도입 — 문제를 장치로 해결하기",
              content: [
                "‘복도 소음이 너무 크다’, ‘화분이 자주 시든다’처럼 작은 문제도 센서로 해결할 수 있습니다.",
                "오늘은 목적→입력→처리→출력→평가의 설계 절차를 연습합니다.",
              ],
            },
            development: {
              title: "전개 — 설계 절차와 점검",
              content: [
                "1. 문제 정의: 누가, 언제, 어떤 불편을 겪는가?",
                "2. 측정 가능 지표: 온도(℃), 거리(cm), 조도(lux) 등.",
                "3. 구성 요소 선택: 필요한 센서/보드/출력장치와 이유.",
                "4. 알고리즘: IF 조건 THEN 동작의 의사코드 작성.",
                "5. 안전·윤리: 개인정보(카메라), 소음, 오작동 대비.",
                "6. 프로토타입 평가: 기대 동작과 실제 차이를 점검하고 개선.",
              ],
              activities: [
                "문제 카드 중 하나를 골라 시스템 구상도(블록 다이어그램) 작성",
                "의사코드 5줄 이상 작성 후 모둠 피드백",
              ],
            },
            summary: {
              title: "정리",
              content: [
                "좋은 피지컬 시스템은 ‘멋진 부품’보다 ‘명확한 목적과 검증’에서 시작됩니다.",
                "다음 대단원에서는 이러한 시스템이 다루는 데이터의 본질을 배웁니다.",
              ],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "식물 자동 급수 시스템에 적합한 센서 한 가지와 이유를 쓰시오.",
                sampleAnswer: "토양 수분 센서 — 흙의 건조 정도를 직접 측정할 수 있어서",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "학교 복도 소음 경보 시스템을 설계하시오. 구성 요소, 동작 조건, 예상 한계를 포함하여 서술하시오.",
                rubric: "목적-구성-조건-한계가 모두 포함되고 논리적으로 연결됨",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "unit-2",
    number: 2,
    title: "데이터",
    color: "#1B4F72",
    accent: "#2E86C1",
    description:
      "자료와 정보, 진법 변환, 문자·그림·소리의 디지털 표현과 데이터 활용을 학습합니다.",
    standards: [
      "[9정02-01]",
      "[9정02-02]",
      "[9정02-03]",
      "[9정02-04]",
      "[9정02-05]",
    ],
    subunits: [
      {
        id: "u2-s1",
        title: "디지털 데이터의 이해",
        description: "자료·정보, 진법, 디지털 표현",
        lessons: [
          {
            id: "u2-s1-l1",
            unitId: "unit-2",
            subunitId: "u2-s1",
            title: "자료와 정보, 정보의 종류와 분류",
            standards: ["[9정02-01]", "[9정02-02]"],
            objectives: [
              "자료와 정보의 차이를 사례로 설명할 수 있다.",
              "정보를 형태·용도·구조에 따라 분류할 수 있다.",
            ],
            youtubeId: "j-0cUmUyb-Y",
            youtubeTitle: "데이터와 정보의 차이",
            intro: {
              title: "도입 — 숫자 36은 자료일까, 정보일까?",
              content: [
                "‘36’만 있으면 의미가 모호합니다. ‘교실 온도 36℃’라면 더위에 대처할 수 있습니다.",
                "가공·맥락·목적이 더해질 때 자료는 정보가 됩니다.",
              ],
            },
            development: {
              title: "전개 — 개념 정리와 분류 실습",
              content: [
                "자료(Data): 관찰·측정으로 얻은 날것(raw)의 사실·수치·기호.",
                "정보(Information): 목적에 맞게 처리·해석되어 의사결정에 도움이 되는 결과.",
                "지식(Knowledge): 정보가 경험·판단과 결합되어 일반화된 이해.",
                "정보의 종류(형태): 문자, 숫자, 이미지, 소리, 영상, 멀티미디어.",
                "분류 기준 예시: 정량/정성, 정형/비정형, 공개/민감, 실시간/누적.",
                "디지털 데이터: 0과 1(비트)로 표현되어 복사·전송·연산이 용이함.",
              ],
              activities: [
                "학교생활 사례 10개를 자료/정보로 분류하기",
                "같은 자료를 다른 목적(성적 분석 vs 급식 만족도)으로 정보화하기",
              ],
            },
            summary: {
              title: "정리",
              content: [
                "자료는 재료, 정보는 요리된 결과물입니다. 목적에 따라 같은 자료도 다른 정보가 됩니다.",
              ],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "자료와 정보의 차이를 한 문장으로 쓰시오.",
                sampleAnswer:
                  "자료는 가공되지 않은 사실이고, 정보는 목적에 맞게 처리되어 의미가 부여된 결과이다.",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "‘출석부 체크 기록’을 자료로 보고, 이를 정보로 활용하는 두 가지 목적을 제시하고 각각 어떻게 가공할지 서술하시오.",
                rubric: "자료→정보 변환 과정, 목적별 가공 방법, 구체성",
              },
            ],
            specialFeature: "number-base",
          },
          {
            id: "u2-s1-l2",
            unitId: "unit-2",
            subunitId: "u2-s1",
            title: "진법과 상호변환, 디지털 표현",
            standards: ["[9정02-01]"],
            objectives: [
              "2·8·10·16진법의 자리값을 설명할 수 있다.",
              "진법 간 상호변환을 수행할 수 있다.",
              "문자·그림·소리의 디지털 표현 원리를 설명할 수 있다.",
            ],
            youtubeId: "FFDMzbrEXaE",
            youtubeTitle: "이진수와 진법 변환 쉽게 이해하기",
            intro: {
              title: "도입 — 컴퓨터는 왜 2진법일까?",
              content: [
                "전기 신호의 ON/OFF는 두 상태로 안정적으로 구분됩니다. 그래서 컴퓨터는 비트(0/1)를 사용합니다.",
                "사람이 읽기 쉽도록 8진·16진 표현도 함께 씁니다.",
              ],
            },
            development: {
              title: "전개 — 진법 변환과 멀티미디어 표현",
              content: [
                "자리값: 각 진법에서 자리마다 밑수의 거듭제곱이 곱해짐. 예) 1011₂ = 8+0+2+1 = 11₁₀.",
                "10→2: 2로 나누어 나머지를 아래부터 읽기. 2→10: 자리값 합.",
                "2↔8: 3비트씩 묶기. 2↔16: 4비트씩 묶기. 16진 자리 A=10 … F=15.",
                "문자: ASCII/유니코드로 문자를 숫자 코드에 대응. ‘A’=65.",
                "그림: 픽셀의 색을 RGB 등으로 샘플링. 해상도↑·색깊이↑ → 용량↑.",
                "소리: 표본화(Sampling)→양자화(Quantization)→부호화(Encoding). 표본률·비트심도가 음질과 용량을 결정.",
              ],
              activities: [
                "진법 변환기 실습으로 10↔2↔8↔16 변환 10문제 풀기",
                "같은 이미지를 해상도/색 수를 바꿔 용량 변화 예측하기",
              ],
            },
            summary: {
              title: "정리",
              content: [
                "모든 디지털 데이터는 결국 비트열입니다. 표현 방식이 품질·용량·호환성을 좌우합니다.",
              ],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "45₁₀을 2진수와 16진수로 변환한 결과를 쓰시오.",
                sampleAnswer: "101101₂, 2D₁₆",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "소리가 디지털로 저장되는 과정(표본화·양자화·부호화)을 설명하고, 음질을 높이려면 무엇을 조절해야 하는지 서술하시오.",
                rubric: "3단계 설명의 정확성, 표본률·비트심도와 음질/용량 관계",
              },
            ],
            specialFeature: "number-base",
          },
        ],
      },
      {
        id: "u2-s2",
        title: "디지털 데이터의 활용",
        description: "수집·구조화·분석·융합 문제 해결",
        lessons: [
          {
            id: "u2-s2-l1",
            unitId: "unit-2",
            subunitId: "u2-s2",
            title: "데이터 수집·구조화·해석",
            standards: ["[9정02-02]", "[9정02-03]", "[9정02-04]", "[9정02-05]"],
            objectives: [
              "문제 해결에 적합한 데이터를 수집·분류할 수 있다.",
              "표·다이어그램으로 구조화하고 관계를 해석할 수 있다.",
            ],
            youtubeId: "yZvnR1k5_U0",
            youtubeTitle: "데이터 시각화란 무엇인가",
            intro: {
              title: "도입 — 숫자 더미에서 이야기 찾기",
              content: [
                "급식 잔반량, 등교 시간, 미세먼지… 데이터는 어디에나 있습니다.",
                "잘 모으고, 정리하고, 관계를 읽으면 문제를 해결할 단서가 됩니다.",
              ],
            },
            development: {
              title: "전개 — 데이터 활용 사이클",
              content: [
                "1) 질문 만들기: 무엇을 알고 싶은가?",
                "2) 수집: 설문, 센서, 공개데이터, 관찰. 출처와 날짜를 기록.",
                "3) 정리·분류: 속성(열)·사례(행)로 표 만들기. 결측·이상치 점검.",
                "4) 구조화: 표, 막대/선/원 그래프, 벤다이어그램, 플로우차트.",
                "5) 해석: 비교·추세·상관. ‘왜?’에 대한 가설과 근거 제시.",
                "6) 융합: 과학(실험값), 사회(통계), 체육(운동량) 등과 연결해 해결책 제안.",
              ],
              activities: [
                "학급 관심사 설문 5문항 설계 후 가상 데이터로 표·그래프 작성",
                "두 변수 관계를 한 문장으로 해석하기",
              ],
            },
            summary: {
              title: "정리",
              content: [
                "데이터 활용은 ‘수집→정리→시각화→해석→실행’의 순환입니다. 근거 있는 주장이 핵심입니다.",
              ],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "데이터를 표로 구조화할 때 행과 열은 각각 무엇을 의미하는가?",
                sampleAnswer: "열은 속성(변수), 행은 개별 사례(관측값)를 의미한다.",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "우리 학교 잔반 줄이기 문제를 데이터로 해결하는 계획을 수집·구조화·해석 단계로 서술하시오.",
                rubric: "단계별 구체성, 데이터 항목 타당성, 해석→해결 연결",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "unit-3",
    number: 3,
    title: "알고리즘과 프로그래밍",
    color: "#6C3483",
    accent: "#A569BD",
    description:
      "문제 정의부터 알고리즘 설계·분석, 파이썬 프로그래밍과 프로젝트까지 학습합니다.",
    standards: [
      "[9정03-01]",
      "[9정03-02]",
      "[9정03-03]",
      "[9정03-04]",
      "[9정03-05]",
      "[9정03-06]",
      "[9정03-07]",
      "[9정03-08]",
      "[9정03-09]",
    ],
    subunits: [
      {
        id: "u3-s1",
        title: "문제 정의와 상태",
        description: "문제 상태를 정의하고 구조화하기",
        lessons: [
          {
            id: "u3-s1-l1",
            unitId: "unit-3",
            subunitId: "u3-s1",
            title: "문제의 상태를 정의하고 구조화하기",
            standards: ["[9정03-01]"],
            objectives: [
              "문제의 현재 상태와 목표 상태를 구분할 수 있다.",
              "제약 조건과 입력·출력을 명시할 수 있다.",
            ],
            youtubeId: "6hfOvsMbE_M",
            youtubeTitle: "컴퓨팅 사고력과 문제 분해",
            intro: {
              title: "도입 — 길을 잃었을 때 먼저 할 일",
              content: [
                "내비게이션도 ‘현재 위치’와 ‘목적지’를 알아야 경로를 만듭니다.",
                "알고리즘의 출발점은 문제 상태의 명확한 정의입니다.",
              ],
            },
            development: {
              title: "전개 — 상태·입력·출력·제약",
              content: [
                "현재 상태(As-Is): 지금 알고 있는 사실과 조건.",
                "목표 상태(To-Be): 해결되었을 때의 모습.",
                "입력/출력: 프로그램이 받고 내놓을 데이터.",
                "제약: 시간, 메모리, 규칙, 사용 가능 도구.",
                "구조화 도구: 문제 정의서, 입출력 표, 상태 다이어그램.",
              ],
              activities: [
                "랜덤 문제 상황에 대해 상태 정의서 작성 → AI 피드백 받기",
              ],
            },
            summary: {
              title: "정리",
              content: [
                "잘 정의된 문제는 절반의 해결입니다. 모호한 문장을 측정 가능한 상태로 바꾸세요.",
              ],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "문제 정의에 반드시 포함해야 할 요소 세 가지를 쓰시오.",
                sampleAnswer: "현재 상태, 목표 상태, 입력/출력(또는 제약 조건)",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "‘급식 대기 줄이 너무 길다’ 문제를 현재 상태·목표 상태·입력·출력·제약으로 구조화하여 서술하시오.",
                rubric: "5요소 포함, 측정 가능성, 논리성",
              },
            ],
            specialFeature: "algorithm-ai",
          },
        ],
      },
      {
        id: "u3-s2",
        title: "핵심 요소와 알고리즘 표현",
        description: "추상화와 알고리즘 표현",
        lessons: [
          {
            id: "u3-s2-l1",
            unitId: "unit-3",
            subunitId: "u3-s2",
            title: "추상화와 알고리즘 표현",
            standards: ["[9정03-02]"],
            objectives: [
              "핵심요소를 추출하는 추상화의 중요성을 설명할 수 있다.",
              "의사코드·순서도로 알고리즘을 표현할 수 있다.",
            ],
            youtubeId: "6hfOvsMbE_M",
            youtubeTitle: "알고리즘을 순서도로 표현하기",
            intro: {
              title: "도입 — 지도를 그릴 때 모든 나무를 그릴까?",
              content: [
                "복잡한 현실에서 문제 해결에 필요한 것만 남기는 과정이 추상화입니다.",
              ],
            },
            development: {
              title: "전개 — 표현 방법",
              content: [
                "추상화: 세부사항을 숨기고 핵심만 남김(분해·일반화·모델링).",
                "의사코드: 사람 언어와 코드의 중간 표현.",
                "순서도: 시작/종료, 처리, 판단, 입출력 기호로 흐름 표현.",
                "자연어 알고리즘: 단계별 지시문. 모호하지 않게 작성.",
              ],
              activities: [
                "랜덤 문제의 핵심요소 3개 추출 후 의사코드 작성 → AI 피드백",
              ],
            },
            summary: {
              title: "정리",
              content: [
                "좋은 알고리즘 표현은 다른 사람이 그대로 따라 할 수 있을 만큼 명확해야 합니다.",
              ],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "순서도에서 마름모 기호는 무엇을 나타내는가?",
                sampleAnswer: "조건 판단(분기)",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "도서관에서 책을 찾는 과정을 추상화하여 핵심요소를 제시하고 의사코드로 표현하시오.",
                rubric: "핵심요소의 타당성, 의사코드 명확성, 종료 조건",
              },
            ],
            specialFeature: "algorithm-ai",
          },
        ],
      },
      {
        id: "u3-s3",
        title: "알고리즘 분석과 비교",
        description: "여러 알고리즘의 장단점 비교",
        lessons: [
          {
            id: "u3-s3-l1",
            unitId: "unit-3",
            subunitId: "u3-s3",
            title: "알고리즘 비교·분석하기",
            standards: ["[9정03-03]"],
            objectives: [
              "같은 문제의 여러 알고리즘을 비교할 수 있다.",
              "정확성·효율성·단순성 관점에서 장단점을 설명할 수 있다.",
            ],
            youtubeId: "RGuJga2Gl_k",
            youtubeTitle: "알고리즘 효율성 기초",
            intro: {
              title: "도입 — 같은 목적, 다른 길",
              content: [
                "집에서 학교까지 가는 길이 여러 개이듯, 알고리즘도 여러 가지입니다. 무엇이 ‘더 좋은가’는 기준에 따라 달라집니다.",
              ],
            },
            development: {
              title: "전개 — 비교 기준",
              content: [
                "정확성: 올바른 결과를 내는가?",
                "효율성: 시간·메모리·에너지 사용은?",
                "단순성·가독성: 이해하고 수정하기 쉬운가?",
                "예시: 최댓값 찾기(한 번 순회 vs 정렬 후 선택), 탐색(순차 vs 이진).",
              ],
              activities: ["두 알고리즘의 단계 수를 표로 비교하고 선택 이유 쓰기"],
            },
            summary: {
              title: "정리",
              content: [
                "효율적인 알고리즘은 시간·에너지·자원을 아끼는 실천이기도 합니다.",
              ],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "알고리즘을 비교할 때 사용하는 기준 두 가지를 쓰시오.",
                sampleAnswer: "정확성, 효율성(시간/메모리) 등",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "정렬되지 않은 100개의 점수에서 최댓값을 찾는 두 가지 방법을 제시하고 장단점을 비교하시오.",
                rubric: "두 방법 제시, 비교 기준, 상황별 선택 근거",
              },
            ],
            specialFeature: "algorithm-ai",
          },
        ],
      },
      {
        id: "u3-s4",
        title: "문제 해결 전략과 알고리즘 설계",
        description: "전략 선택과 설계",
        lessons: [
          {
            id: "u3-s4-l1",
            unitId: "unit-3",
            subunitId: "u3-s4",
            title: "문제 해결 전략 선택하기",
            standards: ["[9정03-04]"],
            objectives: [
              "분해, 패턴 인식, 추상화, 알고리즘 설계 전략을 적용할 수 있다.",
            ],
            youtubeId: "Azr99e6YdUU",
            youtubeTitle: "문제 해결 전략 개요",
            intro: {
              title: "도입",
              content: [
                "큰 문제는 작은 문제로 나누고, 비슷한 패턴을 찾고, 핵심만 남긴 뒤 절차를 설계합니다.",
              ],
            },
            development: {
              title: "전개",
              content: [
                "하향식/상향식, 분할 정복, 그리디(탐욕), 시뮬레이션 등 기초 전략을 사례로 이해합니다.",
                "전략은 ‘정답’이 아니라 ‘상황에 맞는 도구’입니다.",
              ],
              activities: ["랜덤 문제에 적합한 전략을 고르고 근거와 함께 AI 피드백"],
            },
            summary: {
              title: "정리",
              content: ["전략을 고른 이유를 말로 설명할 수 있어야 설계력이 자랍니다."],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "큰 문제를 작은 문제로 나누는 전략을 무엇이라 하는가?",
                sampleAnswer: "분해(또는 분할)",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "학급 체육대회 팀 배정 문제에 적용할 전략을 선택하고 알고리즘 개요를 서술하시오.",
                rubric: "전략 선택 근거, 단계적 설계, 실현 가능성",
              },
            ],
            specialFeature: "algorithm-ai",
          },
        ],
      },
      {
        id: "u3-s5",
        title: "데이터의 순차적 저장",
        description: "리스트·배열과 프로그램",
        lessons: [
          {
            id: "u3-s5-l1",
            unitId: "unit-3",
            subunitId: "u3-s5",
            title: "리스트로 데이터 다루기 (파이썬)",
            standards: ["[9정03-05]"],
            objectives: [
              "리스트에 데이터를 저장하고 순회·검색·집계할 수 있다.",
            ],
            youtubeId: "rfscVS0vtbw",
            youtubeTitle: "파이썬 리스트 기초 (짧은 구간 시청)",
            intro: {
              title: "도입",
              content: [
                "점수 30개를 변수 30개에 담을 수는 없습니다. 순차 저장 구조(리스트)가 필요합니다.",
              ],
            },
            development: {
              title: "전개 — 파이썬 리스트",
              content: [
                "생성: scores = [90, 80, 70]",
                "인덱싱·슬라이싱, append, 반복문 for x in scores",
                "합계·평균·최댓값 구하기 패턴",
              ],
              activities: ["파이썬 랩에서 평균·최댓값 프로그램 작성 → 교사 AI 채점"],
            },
            summary: {
              title: "정리",
              content: ["순차 저장 구조는 대량 데이터를 효과적으로 처리하는 기본 도구입니다."],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "파이썬에서 리스트 마지막에 값을 추가하는 메서드는?",
                sampleAnswer: "append",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "학생 점수 리스트에서 평균과 평균 이상 학생 수를 구하는 알고리즘을 서술하시오.",
                rubric: "입출력, 반복, 조건, 올바른 집계",
              },
            ],
            specialFeature: "python-lab",
          },
        ],
      },
      {
        id: "u3-s6",
        title: "논리연산과 중첩 제어 구조",
        description: "조건·반복의 중첩",
        lessons: [
          {
            id: "u3-s6-l1",
            unitId: "unit-3",
            subunitId: "u3-s6",
            title: "논리연산과 중첩 제어 (파이썬)",
            standards: ["[9정03-06]"],
            objectives: [
              "and/or/not과 중첩 if·for를 활용해 프로그램을 작성할 수 있다.",
            ],
            youtubeId: "kqtD5dpn9C8",
            youtubeTitle: "파이썬 조건문·반복문 기초",
            intro: {
              title: "도입",
              content: [
                "‘비가 오고 우산이 없으면’처럼 조건은 겹칩니다. 논리연산과 중첩 구조로 표현합니다.",
              ],
            },
            development: {
              title: "전개",
              content: [
                "비교연산: <, >, ==, !=",
                "논리연산: and, or, not / 단락 평가",
                "중첩 if, for 안의 if, 이중 반복(구구단·좌표)",
              ],
              activities: ["합격/재시험/불합격 판정 프로그램 작성"],
            },
            summary: {
              title: "정리",
              content: ["중첩이 깊어질수록 가독성을 위해 함수로 나누는 준비가 필요합니다."],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "A와 B가 모두 참일 때만 참이 되는 연산자는?",
                sampleAnswer: "and",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "점수와 출석률로 이수/미이수를 판정하는 중첩 조건 알고리즘을 서술하시오.",
                rubric: "논리연산 사용, 경계값 처리, 명확한 분기",
              },
            ],
            specialFeature: "python-lab",
          },
        ],
      },
      {
        id: "u3-s7",
        title: "함수와 디버깅",
        description: "함수 활용과 오류 수정",
        lessons: [
          {
            id: "u3-s7-l1",
            unitId: "unit-3",
            subunitId: "u3-s7",
            title: "함수 작성과 디버깅 (파이썬)",
            standards: ["[9정03-07]"],
            objectives: [
              "함수로 반복 코드를 모듈화할 수 있다.",
              "오류 메시지를 읽고 디버깅할 수 있다.",
            ],
            youtubeId: "9Os0o3wzS_I",
            youtubeTitle: "파이썬 함수와 디버깅 기초",
            intro: {
              title: "도입",
              content: [
                "같은 코드를 복붙하면 실수가 늘어납니다. 함수는 ‘이름 붙인 절차’입니다.",
              ],
            },
            development: {
              title: "전개",
              content: [
                "def, 매개변수, return",
                "지역변수와 범위",
                "구문 오류·런타임 오류·논리 오류",
                "인쇄(print) 디버깅, 테스트 케이스, 단계적 실행",
              ],
              activities: ["평균 계산 함수 작성 후 의도적 버그 찾아 고치기"],
            },
            summary: {
              title: "정리",
              content: ["디버깅은 실패가 아니라 사고력을 키우는 핵심 활동입니다."],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "함수가 결과를 호출한 곳으로 돌려주는 키워드는?",
                sampleAnswer: "return",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "논리 오류와 구문 오류의 차이를 예를 들어 설명하고, 각각 어떻게 찾는지 서술하시오.",
                rubric: "개념 구분, 예시, 디버깅 방법",
              },
            ],
            specialFeature: "python-lab",
          },
        ],
      },
      {
        id: "u3-s8",
        title: "문제 해결 프로젝트",
        description: "실생활·융합 문제 해결",
        lessons: [
          {
            id: "u3-s8-l1",
            unitId: "unit-3",
            subunitId: "u3-s8",
            title: "실생활 문제 해결 프로젝트",
            standards: ["[9정03-08]", "[9정03-09]"],
            objectives: [
              "실생활 문제를 발견하고 프로그래밍으로 해결할 수 있다.",
              "협력하여 소프트웨어를 개발하는 과정을 경험할 수 있다.",
            ],
            youtubeId: "zOjov-2OZ0E",
            youtubeTitle: "소프트웨어 개발 과정 한눈에",
            intro: {
              title: "도입",
              content: [
                "지금까지 배운 정의·설계·코딩·디버깅을 모아 하나의 작품을 만듭니다.",
              ],
            },
            development: {
              title: "전개 — 프로젝트 절차",
              content: [
                "문제 발견 → 요구사항 → 알고리즘 → 구현 → 테스트 → 발표·회고",
                "역할: 기획, 코딩, 테스트, 발표 자료를 나누어 협력",
                "예시 주제: 자리 배치, 급식 메뉴 추천, 퀴즈 앱, 센서 데이터 알림(시뮬레이션)",
              ],
              activities: ["파이썬으로 미니 프로젝트 구현 후 AI/교사 피드백"],
            },
            summary: {
              title: "정리",
              content: [
                "완성도보다 ‘문제 정의의 명확성’과 ‘개선 과정’이 학습의 핵심입니다.",
              ],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "소프트웨어 개발에서 구현 전에 해야 할 핵심 단계 하나를 쓰시오.",
                sampleAnswer: "문제 정의(또는 알고리즘 설계, 요구사항 분석)",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "모둠 프로젝트에서 본인이 담당한 역할, 해결한 문제, 남긴 한계와 개선 계획을 서술하시오.",
                rubric: "역할·과정·회고의 구체성, 협력 태도",
              },
            ],
            specialFeature: "python-lab",
          },
        ],
      },
    ],
  },
  {
    id: "unit-4",
    number: 4,
    title: "인공지능",
    color: "#B9770E",
    accent: "#F4D03F",
    description:
      "인공지능 개념, 데이터와 학습, 문제 해결, 윤리를 체험형으로 학습합니다.",
    standards: [
      "[9정04-01]",
      "[9정04-02]",
      "[9정04-03]",
      "[9정04-04]",
      "[9정04-05]",
    ],
    subunits: [
      {
        id: "u4-s1",
        title: "인공지능과 인공지능 시스템",
        description: "개념·특성·소프트웨어 구별",
        lessons: [
          {
            id: "u4-s1-l1",
            unitId: "unit-4",
            subunitId: "u4-s1",
            title: "인공지능의 개념과 시스템 구성",
            standards: ["[9정04-01]"],
            objectives: [
              "인공지능의 개념과 특성을 설명할 수 있다.",
              "일반 소프트웨어와 AI 소프트웨어를 구별할 수 있다.",
            ],
            youtubeId: "aircAruvnKk",
            youtubeTitle: "신경망이 뭔가요? (3Blue1Brown 요약 구간)",
            intro: {
              title: "도입",
              content: [
                "추천 영상, 얼굴 인식, 번역기… 이미 AI는 일상에 들어와 있습니다. ‘지능처럼 보이는 행동’의 정체를 살펴봅시다.",
              ],
            },
            development: {
              title: "전개",
              content: [
                "AI: 인간의 학습·추론·인식 능력을 모방하는 기술/시스템.",
                "구성: 데이터 + 모델(알고리즘) + 학습 + 추론(예측).",
                "약한 AI(특정 과제) vs 일반 AI(인간 수준, 연구 단계).",
                "규칙 기반 프로그램: if-else로 사람이 규칙 작성.",
                "학습 기반 AI: 데이터에서 패턴을 스스로 찾아 규칙에 가까운 것을 형성.",
              ],
              activities: ["앱 10개를 AI/비AI로 분류하고 근거 쓰기"],
            },
            summary: {
              title: "정리",
              content: ["AI는 마법이 아니라 데이터와 모델로 동작하는 시스템입니다."],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "인공지능 시스템을 구성하는 핵심 요소 세 가지를 쓰시오.",
                sampleAnswer: "데이터, 모델(알고리즘), 학습/추론",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "규칙 기반 스팸 필터와 학습 기반 스팸 필터의 차이를 장단점과 함께 서술하시오.",
                rubric: "개념 구분, 장단점, 사례",
              },
            ],
            specialFeature: "ai-model-lab",
          },
        ],
      },
      {
        id: "u4-s2",
        title: "인공지능과 데이터",
        description: "학습 데이터의 중요성과 분류",
        lessons: [
          {
            id: "u4-s2-l1",
            unitId: "unit-4",
            subunitId: "u4-s2",
            title: "학습 데이터 수집과 분류",
            standards: ["[9정04-02]"],
            objectives: [
              "학습 데이터의 중요성을 설명할 수 있다.",
              "라벨링·분류의 의미를 이해하고 실습할 수 있다.",
            ],
            youtubeId: "R9OHn5ZF4Uo",
            youtubeTitle: "머신러닝에서 데이터가 중요한 이유",
            intro: {
              title: "도입",
              content: [
                "편중된 데이터로 학습하면 편중된 결과가 나옵니다. ‘가비지 인, 가비지 아웃’.",
              ],
            },
            development: {
              title: "전개",
              content: [
                "학습/검증/테스트 데이터",
                "지도 학습: 입력+정답(라벨)",
                "데이터 품질: 양, 다양성, 정확성, 대표성, 최신성",
                "편향: 특정 집단이 과소/과대 대표되면 불공정한 결과",
              ],
              activities: ["AI 모델 랩에서 학습 데이터를 직접 입력·분류하기"],
            },
            summary: {
              title: "정리",
              content: ["좋은 AI의 출발점은 좋은 데이터입니다."],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "지도 학습에서 ‘라벨’이란 무엇을 뜻하는가?",
                sampleAnswer: "입력 데이터에 대한 정답(정답 범주/값)",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "얼굴 인식 학습 데이터에 특정 피부색이 거의 없다면 어떤 문제가 생기는지, 해결 방향과 함께 서술하시오.",
                rubric: "편향 인식, 영향, 개선 방안",
              },
            ],
            specialFeature: "ai-model-lab",
          },
        ],
      },
      {
        id: "u4-s3",
        title: "인공지능 시스템을 이용한 문제 해결",
        description: "모델 구성과 적용",
        lessons: [
          {
            id: "u4-s3-l1",
            unitId: "unit-4",
            subunitId: "u4-s3",
            title: "나만의 AI 모델로 문제 해결하기",
            standards: ["[9정04-03]", "[9정04-04]"],
            objectives: [
              "데이터를 넣어 간단한 분류 모델을 만들고 적용할 수 있다.",
              "AI로 해결 가능한 문제를 선별할 수 있다.",
            ],
            youtubeId: "4RAvFwK5_4Q",
            youtubeTitle: "분류 모델 개념 쉽게 보기",
            intro: {
              title: "도입",
              content: [
                "오늘은 직접 예시를 넣고 ‘학습 → 예측’을 체험합니다. (교육용 간단 모델)",
              ],
            },
            development: {
              title: "전개",
              content: [
                "문제 선정: 텍스트/특성으로 범주 나누기(예: 감정, 과일, 재활용).",
                "데이터 입력 → 학습 → 새 입력으로 예측 → 오분류 분석 → 데이터 보강.",
                "AI가 적합한 문제: 패턴이 있고 데이터가 충분한 인식·분류·추천.",
                "부적합한 경우: 데이터 없음, 윤리적 금지, 규칙이 명확한 단순 계산 등.",
              ],
              activities: ["AI 모델 랩에서 분류기 만들고 테스트"],
            },
            summary: {
              title: "정리",
              content: ["모델 성능은 데이터와 문제 정의의 품질을 비춥니다."],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "학습이 끝난 모델에 새로운 입력을 넣어 결과를 얻는 과정을 무엇이라 하는가?",
                sampleAnswer: "추론(예측, inference)",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "본인이 만든 분류 모델의 목적, 데이터, 잘된 점과 개선점을 서술하시오.",
                rubric: "목적-데이터-평가-개선 연결",
              },
            ],
            specialFeature: "ai-model-lab",
          },
        ],
      },
      {
        id: "u4-s4",
        title: "인공지능 윤리",
        description: "데이터·활용의 윤리적 쟁점",
        lessons: [
          {
            id: "u4-s4-l1",
            unitId: "unit-4",
            subunitId: "u4-s4",
            title: "인공지능 윤리와 책임",
            standards: ["[9정04-05]"],
            objectives: [
              "데이터 수집·활용의 윤리 문제를 파악할 수 있다.",
              "타당성 있는 해결 방안을 구상할 수 있다.",
            ],
            youtubeId: "s0fQ6b3o8Q0",
            youtubeTitle: "AI 윤리, 왜 중요할까?",
            intro: {
              title: "도입",
              content: [
                "편리한 AI도 편향, 개인정보, 가짜정보, 책임 소재 문제를 일으킬 수 있습니다.",
              ],
            },
            development: {
              title: "전개",
              content: [
                "핵심 쟁점: 편향·차별, 개인정보, 투명성, 책임, 딥페이크, 노동·환경 영향.",
                "사람 중심 AI: 인간의 존엄과 권리를 우선.",
                "해결 방향: 다양성 있는 데이터, 동의와 최소화, 설명 가능성, 인간 감독 결정, 법·규범.",
              ],
              activities: ["윤리 딜레마 카드에 대한 찬반 근거 작성"],
            },
            summary: {
              title: "정리",
              content: ["기술을 만드는 힘에는 책임도 따릅니다. 시민으로서의 판단력이 필요합니다."],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "AI 윤리에서 ‘편향’이란 무엇인지 간단히 쓰시오.",
                sampleAnswer:
                  "학습 데이터나 설계의 치우침으로 특정 집단에 불공정한 결과가 나타나는 현상",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "학교 출입 얼굴인식 도입에 대해 찬성 또는 반대 입장을 정하고, 윤리 원칙을 근거로 서술하시오.",
                rubric: "입장 명확, 윤리 원칙 연결, 대안 제시",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "unit-5",
    number: 5,
    title: "디지털 문화",
    color: "#922B21",
    accent: "#E74C3C",
    description:
      "디지털 사회와 진로, 윤리·개인정보·저작권·CCL을 활동 중심으로 학습합니다.",
    standards: ["[9정05-01]", "[9정05-02]", "[9정05-03]"],
    subunits: [
      {
        id: "u5-s1",
        title: "디지털 사회와 진로",
        description: "사회 변화와 직업의 변화",
        lessons: [
          {
            id: "u5-s1-l1",
            unitId: "unit-5",
            subunitId: "u5-s1",
            title: "정보사회 과거·현재·미래와 진로",
            standards: ["[9정05-01]"],
            objectives: [
              "디지털 사회의 특성을 탐구할 수 있다.",
              "사회 변화에 따른 직업 변화를 설명할 수 있다.",
            ],
            youtubeId: "GRvtzq3_Y6c",
            youtubeTitle: "디지털 전환과 미래 직업",
            intro: {
              title: "도입",
              content: [
                "부모 세대의 ‘컴퓨터실’과 오늘의 ‘클라우드·AI’는 다릅니다. 과거-현재-미래로 나누어 생각해 봅시다.",
              ],
            },
            development: {
              title: "전개",
              content: [
                "과거: PC·인터넷 보급, 정보 검색의 시작.",
                "현재: 모바일·플랫폼·데이터·AI가 일상과 노동을 재편.",
                "미래: 인간-AI 협업, 디지털 시민성, 평생학습이 중요.",
                "직업 변화: 사라지는 반복 업무, 새롭게 생기는 데이터·보안·콘텐츠·돌봄+테크 융합 직무.",
              ],
              activities: [
                "과거-현재-미래 의견 작성 활동",
                "관심 직업 1개의 디지털 역량 요구 분석",
              ],
            },
            summary: {
              title: "정리",
              content: [
                "진로는 ‘직업 이름’보다 ‘해결하는 문제와 필요한 역량’으로 설계하는 것이 유리합니다.",
              ],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "디지털 사회에서 새롭게 중요해진 역량 한 가지를 쓰시오.",
                sampleAnswer: "데이터 리터러시(또는 디지털 윤리, AI 소양 등)",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "정보사회의 과거·현재·미래를 각각 특징 지어 서술하고, 나의 진로에 주는 시사점을 쓰시오.",
                rubric: "시대상 구분, 구체성, 진로 연계",
              },
            ],
            specialFeature: "digital-culture",
          },
        ],
      },
      {
        id: "u5-s2",
        title: "디지털 윤리와 권리 보호",
        description: "개인정보·저작권·CCL",
        lessons: [
          {
            id: "u5-s2-l1",
            unitId: "unit-5",
            subunitId: "u5-s2",
            title: "개인정보·저작권·CCL과 디지털 윤리",
            standards: ["[9정05-02]", "[9정05-03]"],
            objectives: [
              "개인정보의 종류·분류·보호 방법을 설명할 수 있다.",
              "저작물·저작권·CCL을 이해하고 실천할 수 있다.",
            ],
            youtubeId: "xy9nSXl4e3c",
            youtubeTitle: "저작권과 CCL 이해하기",
            intro: {
              title: "도입",
              content: [
                "나의 생일, 위치, 사진, 검색 기록… 이것도 개인정보일 수 있습니다. 창작물의 권리도 함께 배웁니다.",
              ],
            },
            development: {
              title: "전개",
              content: [
                "개인정보: 살아 있는 개인을 알아볼 수 있는 정보(단독 또는 결합).",
                "종류/분류: 일반 개인정보, 고유식별정보, 민감정보; 식별자/준식별자.",
                "보호 방법: 최소수집, 동의, 접근통제, 암호화, 잠금·핀, 피싱 주의, 계정 보안.",
                "저작물: 인간의 사상·감정을 표현한 창작물. 저작권은 창작과 동시에 발생(무방식주의).",
                "이용: 저작재산권(복제·공중송신 등), 저작인격권. 수업 목적의 예외는 조건을 확인할 것.",
                "CCL(Creative Commons License): 창작자가 이용 조건을 미리 표시. BY, NC, ND, SA 조합.",
              ],
              activities: [
                "개인정보 분류 카드 활동",
                "CCL 라이선스 고르기 시뮬레이션",
                "안전한 디지털 생활 규칙 학급 공약 만들기",
              ],
            },
            summary: {
              title: "정리",
              content: [
                "편리함과 권리를 함께 지키는 습관이 디지털 시민의 기본입니다.",
              ],
            },
            assessment: [
              {
                id: "q1",
                type: "short",
                prompt: "CCL에서 BY가 의미하는 바는 무엇인가?",
                sampleAnswer: "저작자 표시(Attribution)",
              },
              {
                id: "q2",
                type: "essay",
                prompt:
                  "친구의 SNS 사진을 수업 발표 자료에 넣고 싶을 때, 개인정보와 저작권 측면에서 지켜야 할 점을 서술하시오.",
                rubric: "개인정보·저작권 모두 언급, 동의/출처/CCL 등 실천 방안",
              },
            ],
            specialFeature: "digital-culture",
          },
        ],
      },
    ],
  },
];

export function getAllLessons() {
  return curriculum.flatMap((unit) =>
    unit.subunits.flatMap((sub) => sub.lessons)
  );
}

export function getLessonById(id: string) {
  return getAllLessons().find((l) => l.id === id);
}

export function getUnitById(id: string) {
  return curriculum.find((u) => u.id === id);
}

export function lessonPathLabel(lessonId: string): string {
  for (const unit of curriculum) {
    for (const sub of unit.subunits) {
      for (const lesson of sub.lessons) {
        if (lesson.id === lessonId) {
          return `${unit.number}. ${unit.title} › ${sub.title} › ${lesson.title}`;
        }
      }
    }
  }
  if (lessonId === "lobby") return "수업 로비";
  if (lessonId === "home") return "메인";
  return lessonId;
}
