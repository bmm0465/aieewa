"use strict";(()=>{var e={};e.id=867,e.ids=[867],e.modules={9415:e=>{e.exports=require("@langchain/core/output_parsers")},6666:e=>{e.exports=require("@langchain/core/prompts")},8775:e=>{e.exports=require("@langchain/openai")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},5477:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},7310:e=>{e.exports=require("url")},9796:e=>{e.exports=require("zlib")},2638:(e,t,r)=>{r.r(t),r.d(t,{headerHooks:()=>I,originalPathname:()=>C,patchFetch:()=>R,requestAsyncStorage:()=>S,routeModule:()=>b,serverHooks:()=>P,staticGenerationAsyncStorage:()=>x,staticGenerationBailout:()=>q});var o={};r.r(o),r.d(o,{POST:()=>v,dynamic:()=>E,maxDuration:()=>f,runtime:()=>y});var n=r(5419),s=r(9108),a=r(9678),l=r(8070),c=r(8775),i=r(6666),u=r(9415);let _=require("@langchain/core/documents"),h=require("@langchain/core/messages");var m=r(5256);let g=m.Ry({단원_및_학년:m.Z_().describe("단원과 학년"),예시문:m.Z_().describe("평가에 사용할 예시문"),평가문항:m.Z_().describe("서술형 평가 문항"),조건:m.Z_().describe("서술형 평가 문항 조건"),모범_답안_1:m.Z_().describe("모범 답안 1"),모범_답안_2:m.Z_().describe("모범 답안 2"),분석적_채점_기준_1:m.Z_().describe("답안에 대한 분석적 채점 기준 1의 점수와 점수별 예상 수행"),분석적_채점_기준_2:m.Z_().describe("답안에 대한 분석적 채점 기준 2의 점수와 점수별 예상 수행"),분석적_채점_기준_3:m.Z_().describe("답안에 대한 분석적 채점 기준 3의 점수와 점수별 예상 수행"),총체적_채점_기준_A:m.Z_().describe("총체적 채점 기준의 A 수준"),총체적_채점_기준_B:m.Z_().describe("총체적 채점 기준의 B 수준"),총체적_채점_기준_C:m.Z_().describe("총체적 채점 기준의 C 수준"),성취수준별_예시_답안_A:m.Z_().describe("성취 수준에 따른 A 수준의 예시 답안"),성취수준별_예시_답안_B:m.Z_().describe("성취 수준에 따른 B 수준의 예시 답안"),성취수준별_예시_답안_C:m.Z_().describe("성취 수준에 따른 C 수준의 예시 답안"),성취수준별_평가에_따른_예시_피드백_A:m.Z_().describe("답안 평가에 따른 A 수준의 예시 피드백"),성취수준별_평가에_따른_예시_피드백_B:m.Z_().describe("답안 평가에 따른 B 수준의 예시 피드백"),성취수준별_평가에_따른_예시_피드백_C:m.Z_().describe("답안 평가에 따른 C 수준의 예시 피드백")});m.Ry({score:m.Rx().min(1).max(4).describe("1~4")}),m.Ry({score:m.Rx().min(1).max(4).describe("1~4")});var d=r(8234),p=r(7399);class A{async search(e,t=8){try{console.log("Vercel 최적화 RAG 검색 시작:",e);let r=await this.keywordSearch(e,Math.min(t,5)),o=[];try{o=await this.vectorSearch(e,Math.min(t,5))}catch(e){console.warn("벡터 검색 실패, 키워드 검색만 사용:",e)}let n=[...o,...r],s=this.deduplicateResults(n).sort((e,t)=>"vector"===e.searchType&&"keyword"===t.searchType?-1:"keyword"===e.searchType&&"vector"===t.searchType?1:t.relevanceScore-e.relevanceScore).slice(0,t);return console.log(`검색 완료: ${s.length}개 결과 (벡터: ${o.length}, 키워드: ${r.length})`),s}catch(e){return console.error("RAG 검색 오류:",e),[]}}async keywordSearch(e,t){let r=e.split(" ").filter(e=>e.length>1);if(0===r.length)return[];let o=r.map(e=>`chunk_text.ilike.%${e}%`).join(","),{data:n,error:s}=await this.supabase.from("document_chunks").select("chunk_text, metadata").or(o).limit(2*t);return s||!n?(console.error("키워드 검색 오류:",s),[]):n.map(t=>({text:t.chunk_text,metadata:t.metadata,relevanceScore:this.calculateKeywordScore(t.chunk_text,e,r),searchType:"keyword"}))}async vectorSearch(e,t){try{let r=await (0,p.eB)(e),{data:o,error:n}=await this.supabase.from("document_chunks").select("chunk_text, metadata, embedding").not("embedding","is",null).limit(3*t);if(n||!o)throw Error("벡터 데이터 조회 실패");return o.map(e=>{if(!e.embedding||!Array.isArray(e.embedding))return null;let t=this.cosineSimilarity(r,e.embedding);return{text:e.chunk_text,metadata:e.metadata,relevanceScore:10*t,searchType:"vector"}}).filter(e=>null!==e&&e.relevanceScore>.5).sort((e,t)=>t.relevanceScore-e.relevanceScore).slice(0,t)}catch(e){return console.error("벡터 검색 오류:",e),[]}}deduplicateResults(e){let t=new Set;return e.filter(e=>{let r=e.text.substring(0,100);return!t.has(r)&&(t.add(r),!0)})}calculateKeywordScore(e,t,r){let o=e.toLowerCase(),n=t.toLowerCase(),s=r.map(e=>e.toLowerCase()),a=0;return s.forEach(e=>{o.includes(e)&&(a+=2,n.includes(e)&&(a+=1))}),o.includes(n)&&(a+=3),e.length<50&&(a-=1),e.length>2e3&&(a-=1),a}cosineSimilarity(e,t){if(e.length!==t.length)return 0;let r=0,o=0,n=0;for(let s=0;s<e.length;s++)r+=e[s]*t[s],o+=e[s]*e[s],n+=t[s]*t[s];return 0===o||0===n?0:r/(Math.sqrt(o)*Math.sqrt(n))}constructor(){this.supabase=(0,d.B$)()}}process.env.OPENAI_API_KEY=process.env.OPENAI_API_KEY;class w{constructor(){if(!process.env.OPENAI_API_KEY)throw Error("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.");try{this.llmGen=new c.ChatOpenAI({modelName:"gpt-4o",temperature:.3,openAIApiKey:process.env.OPENAI_API_KEY}),this.llmJudge=new c.ChatOpenAI({modelName:"gpt-4o",temperature:0,openAIApiKey:process.env.OPENAI_API_KEY}),this.parser=g}catch(e){throw console.error("AQGAgent 초기화 오류:",e),Error("AI 모델 초기화에 실패했습니다.")}}async initializeRetrieval(){this.optimizedRAG=new A,this.retrieval={invoke:async e=>{try{console.log("Vercel 최적화 RAG 검색 시작:",e);let t=(await this.optimizedRAG.search(e,8)).map(e=>new _.Document({pageContent:e.text,metadata:{...e.metadata,relevanceScore:e.relevanceScore,searchType:e.searchType}}));return console.log(`Vercel RAG 검색 완료: ${t.length}개 문서`),t}catch(e){return console.error("Vercel RAG 검색 오류:",e),[]}}}}calculateKeywordScore(e,t,r){let o=e.toLowerCase(),n=t.toLowerCase(),s=r.map(e=>e.toLowerCase()),a=0;return s.forEach(e=>{o.includes(e)&&(a+=2,n.includes(e)&&(a+=1))}),o.includes(n)&&(a+=3),e.length<50&&(a-=1),e.length>2e3&&(a-=1),a}getPromptTemplate(){let e=[{context:"context",request:"5학년 10단원 영어 서술형 평가 문항과 채점 기준을 생성해줘.",answer:`예시문: Food Festival
Can you come to the food festival?
The festival is on June 10th.
You can eat some food.
You can cook some food, too.
Please come to Green Park at 11.

평가 문항: 예시문을 참고하여 자신이 정한 행사에 초대하는 글을 쓰세요.

조건:
∙ Food Festival 이외의 행사를 정할 것
∙ 예시문의 밑줄 친 부분은 모두 다른 표현으로 바꿀 것
∙ 밑줄 친 부분 이외의 내용도 모두 쓸 것
∙ 대소문자, 철자법에 맞춰 쓸 것

모범 답안 1:
Robot Festival
Can you come to the robot festival?
The festival is on May 15th.
You can see many robots.
You can make your robots, too.
Please come to the Science Museum at 2.

모범 답안 2:
Book Festival
Can you come to the book festival?
The festival is on September 21st.
You can buy and sell books.
You can meet famous writer, too.
Please come to school library at 12.

분석적 채점 기준(과제수행: 내용의 적절성 및 완성도)
2점: 조건을 모두 충족하는 경우
1점: 조건을 모두 충족하지는 못하나 전체적으로 초대의 목적에 맞게 의미가 전달되는 경우
0점: 무응답 또는 초대의 목적에 맞게 의미가 전달되지 않는 경우

분석적 채점 기준(구성: 응집성 및 일관성)
2점: 글의 응집성과 일관성이 잘 갖추어져 있는 경우
1점: 글의 응집성과 일관성이 다소 미흡한 경우
0점: 무응답 또는 글의 응집성이 전혀 찾아볼 수 없는 경우

분석적 채점 기준(언어사용: 어휘 및 어법의 정확성)
2점: 대소문자, 어휘 및 어법 오류가 거의 없는 경우
1점: 대소문자, 어휘 및 어법 오류가 비교적 많은 경우
0점: 무응답 또는 대소문자, 어휘 및 어법 오류가 매우 많은 경우

총체적 채점 기준 A 수준: 글의 분량이 풍부하며 자신이 세운 계획을 바탕으로 자신의 행사에 관해 체계적으로 서술하였다. 전반적으로 자신이 개최하고자 하는 행사에 관하여 관련성이 높은 내용을 자료에서 선별하여 사용하였고, 응집성 및 일관성이 높아 완성도 있는 글을 작성하였다.

총체적 채점 기준 B 수준: 글의 분량이 적절하며 자신이 세운 계획을 바탕으로 자신의 행사에 관해 적절하게 서술하였다. 자신이 개최하고자 하는 행사에 관하여 관련성이 떨어지는 내용을 포함하거나 꼭 필요한 요소가 빠져 있어 응집성 및 일관성이 부족하고 완성도가 떨어진다.

총체적 채점 기준 C 수준: 글의 분량이 매우 부족하며 자신이 세운 계획을 바탕으로 구성되어 있지 않아 자신이 개최하고자 하는 행사에 관해 미흡하게 서술하였다. 행사에 관한 내용이 부분적으로 포함되어 있긴 하나 관련성이 떨어지는 내용을 포함하여 응집성 및 일관성이 부족하여 완성된 글로 보기 어렵다.

성취수준별 예시 답안 A 수준:
Robot Festival
Can you come to the robot festival?
The festival is on May 15th.
You can see many robots.
You can make your robots, too.
Please come to the Science Museum at 2.

성취수준별 예시 답안 B 수준:
Robot Festival
Can you come to the festival?
The festival is on Decemper 21th.
You can eat foods. You can play, too.
Please come to house 12.

성취수준별 예시 답안 C 수준:
Robot Festival
Can you come festival?
The festival Juny 1th.
You can play Please come 1

성취수준별 평가에 따른 예시 피드백 A: 자신이 생각한 행사에 대해 행사 이름, 날짜와 시간, 장소, 할 일을 계획하고 이에 대해 하나의 글로 작성하였습니다. 글의 흐름이 자연스럽고 어휘와 어법, 철자법과 대소문자의 오류가 없습니다. 다른 친구들의 글을 바꿔 읽고 서로 의견을 나누는 활동이 도움이 될 것입니다.

성취수준별 평가에 따른 예시 피드백 B: 자신이 계획한 행사에 대해 필요한 정보 중 일부만 서술했습니다. 그래서 글의 흐름이 부자연스럽습니다. 초대하는 글에 필요한 정보를 보충하여 자연스럽고 완성된 글의 형태로 작성해 보는 연습을 하세요. 의미는 이해할 수 있으나 어휘 및 어법, 철자법이나 대소문자 사용에 관해 실수가 보이므로 제출하기 전에 스스로 꼼꼼하게 살펴보세요. 다양한 행사 초대장을 찾아 읽어 보고, 그것을 따라 써 보기를 추천합니다.

성취수준별 평가에 따른 예시 피드백 C: 자신이 계획한 행사가 어떤 것인지에 대한 정보가 부족합니다. 초대하는 글에 들어가는 행사 이름, 날짜와 시간, 장소, 할 일에 대한 어휘를 학습하고 문장으로 쓰는 연습을 해 보세요. 그림과 함께 있는 쉽고 간단한 초대 글을 찾아 읽기를 추천합니다.`}],t=new i.PromptTemplate({inputVariables:["context","request","answer"],template:"context: {context} \n request: {request} \n answer: {answer}"});return new i.FewShotPromptTemplate({examples:e,examplePrompt:t,prefix:`당신은 초등 영어 서술형 평가 문항 및 채점 기준을 전문적으로 개발하는 평가 전문가입니다. 
당신의 역할은 예시와 검색된 문서 내용을 바탕으로, 초등학생 수준에 적합하고 교육과정에 부합하는 평가 문항과 채점 기준을 생성하는 것입니다. 
문항과 채점 기준은 다음과 같은 조건을 충족해야 합니다: 
1) 사용되는 어휘와 문장 구성은 교과서 수준과 유사해야 합니다. 
2) 예시문이나 모범 답안의 주제나 내용은 창의적이고 초등학생이 흥미를 가질 수 있는 것이어야 합니다. 
3) 평가 문항과 채점 기준은 내용 타당도가 높도록 구성되어야 하며, 교육과정 성취기준에 부합해야 합니다. 
이러한 조건을 바탕으로, 적절한 평가 문항과 채점 기준을 생성해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "단원_및_학년": "단원과 학년 정보",
  "예시문": "평가에 사용할 예시문",
  "평가문항": "서술형 평가 문항",
  "조건": "서술형 평가 문항 조건",
  "모범_답안_1": "모범 답안 1",
  "모범_답안_2": "모범 답안 2",
  "분석적_채점_기준_1": "분석적 채점 기준 1",
  "분석적_채점_기준_2": "분석적 채점 기준 2",
  "분석적_채점_기준_3": "분석적 채점 기준 3",
  "총체적_채점_기준_A": "총체적 채점 기준 A",
  "총체적_채점_기준_B": "총체적 채점 기준 B",
  "총체적_채점_기준_C": "총체적 채점 기준 C",
  "성취수준별_예시_답안_A": "A 수준 예시 답안",
  "성취수준별_예시_답안_B": "B 수준 예시 답안",
  "성취수준별_예시_답안_C": "C 수준 예시 답안",
  "성취수준별_평가에_따른_예시_피드백_A": "A 수준 피드백",
  "성취수준별_평가에_따른_예시_피드백_B": "B 수준 피드백",
  "성취수준별_평가에_따른_예시_피드백_C": "C 수준 피드백"
}

아래는 평가 문항과 채점 기준 예시입니다.:`,suffix:"context: {context} \n request: {request} \n answer:",inputVariables:["context","request"]})}async retrieve(e){console.log("[AQG - RETRIEVE]"),this.retrieval||await this.initializeRetrieval();let t=await this.retrieval.invoke(e.request);return e.context=t.map((e,t)=>{let r=e.metadata?.relevanceScore||0,o=e.metadata?.source||"unknown";return`[문서 ${t+1}] (관련성: ${r}, 출처: ${o})
${e.pageContent}`}).join("\n\n"),e}async requestContextRelevanceJudge(e){console.log("[AQG - REQUEST-CONTEXT JUDGE]");let t=i.ChatPromptTemplate.fromMessages([["system",`당신은 초등 영어 서술형 평가 문항과 채점 기준 개발 전문가입니다.
다음은 교사의 요청(request)이 있고, 이를 위해 검색된 문서(context)가 주어졌습니다.

요청과 문서의 관련성을 다음의 4점 척도를 기준으로 평가하세요:
1점: 관련성이 매우 낮음 - 문서 내용이 요청과 전혀 무관하거나 관련성이 매우 낮음
2점: 관련성이 낮음 - 문서 내용이 요청한 내용과 일부 관련이 있으나, 핵심적인 정보나 세부 사항이 부족함
3점: 관련성이 높음 - 문서 내용이 요청한 내용과 대부분 관련이 있으며, 주요 정보와 세부 사항을 포함하고 있음
4점: 관련성이 매우 높음 - 문서 내용이 요청한 내용과 완전히 일치하며, 요청한 모든 정보와 세부 사항을 포괄적으로 제공함

점수는 숫자로만 반환하세요.`],["human","요청: {request} \n 검색된 문서: {context}"]]).pipe(this.llmJudge).pipe(new u.StringOutputParser),r=await t.invoke({request:e.request,context:e.context}),o=parseInt(r.match(/\d+/)?.[0]||"1");return console.log(`Request-Context Relevance Score: ${o}`),o>=3?"relevant":"not relevant"}async generate(e){console.log("[AQG - GENERATE]");try{let t,r;let o=`당신은 초등 영어 서술형 평가 문항 및 채점 기준을 전문적으로 개발하는 평가 전문가입니다. 
당신의 역할은 예시와 검색된 문서 내용을 바탕으로, 초등학생 수준에 적합하고 교육과정에 부합하는 평가 문항과 채점 기준을 생성하는 것입니다. 
문항과 채점 기준은 다음과 같은 조건을 충족해야 합니다: 
1) 사용되는 어휘와 문장 구성은 교과서 수준과 유사해야 합니다. 
2) 예시문이나 모범 답안의 주제나 내용은 창의적이고 초등학생이 흥미를 가질 수 있는 것이어야 합니다. 
3) 평가 문항과 채점 기준은 내용 타당도가 높도록 구성되어야 하며, 교육과정 성취기준에 부합해야 합니다. 

다음 JSON 형식으로 응답해주세요:
{
  "단원_및_학년": "단원과 학년 정보를 여기에 입력",
  "예시문": "평가에 사용할 예시문을 여기에 입력",
  "평가문항": "서술형 평가 문항을 여기에 입력",
  "조건": "서술형 평가 문항 조건을 여기에 입력",
  "모범_답안_1": "모범 답안 1을 여기에 입력",
  "모범_답안_2": "모범 답안 2를 여기에 입력",
  "분석적_채점_기준_1": "분석적 채점 기준 1을 여기에 입력",
  "분석적_채점_기준_2": "분석적 채점 기준 2를 여기에 입력",
  "분석적_채점_기준_3": "분석적 채점 기준 3을 여기에 입력",
  "총체적_채점_기준_A": "총체적 채점 기준 A를 여기에 입력",
  "총체적_채점_기준_B": "총체적 채점 기준 B를 여기에 입력",
  "총체적_채점_기준_C": "총체적 채점 기준 C를 여기에 입력",
  "성취수준별_예시_답안_A": "A 수준 예시 답안을 여기에 입력",
  "성취수준별_예시_답안_B": "B 수준 예시 답안을 여기에 입력",
  "성취수준별_예시_답안_C": "C 수준 예시 답안을 여기에 입력",
  "성취수준별_평가에_따른_예시_피드백_A": "A 수준 피드백을 여기에 입력",
  "성취수준별_평가에_따른_예시_피드백_B": "B 수준 피드백을 여기에 입력",
  "성취수준별_평가에_따른_예시_피드백_C": "C 수준 피드백을 여기에 입력"
}`,n=`검색된 문서 (관련성 점수와 함께):
${e.context||"검색된 문서가 없습니다."}

요청: ${e.request}

위 검색된 문서들을 참고하여, 특히 관련성이 높은 내용을 우선적으로 활용하여 적절한 평가 문항과 채점 기준을 생성해주세요. 큰 교과서 PDF의 내용도 충분히 반영하여 질 높은 문항을 만들어주세요.`,s=[new h.SystemMessage(o),new h.HumanMessage(n)];console.log("LLM 호출 시작");let a=await this.llmGen.invoke(s);if(console.log("LLM 응답 받음, 타입:",typeof a),t=a&&"object"==typeof a&&"content"in a?String(a.content):String(a),console.log("응답 콘텐츠 길이:",t?.length||0),!t||"undefined"===t||"null"===t)throw Error("LLM이 유효한 응답을 반환하지 않았습니다.");console.log("JSON 파싱 시도 시작");let l=t.trim();for(let e of[/```json\s*([\s\S]*?)\s*```/,/```\s*([\s\S]*?)\s*```/,/(\{[\s\S]*\})/]){let t=l.match(e);if(t){l=t[1]||t[0];break}}l=l.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim(),console.log("정리된 JSON:",l.substring(0,200)+"...");try{r=JSON.parse(l)}catch(o){console.error("JSON.parse 실패:",o),console.log("시도한 JSON:",l);let e=l.indexOf("{"),t=l.lastIndexOf("}");if(-1!==e&&-1!==t&&t>e){let o=l.substring(e,t+1);console.log("부분 JSON 추출 시도:",o.substring(0,100)+"..."),r=JSON.parse(o)}else throw o}console.log("JSON 파싱 성공");let c=g.parse(r);return console.log("스키마 검증 성공"),e.answer=c,e}catch(t){if(console.error("generate 메서드 전체 오류:",t),console.error("state.request:",e.request),console.error("state.context:",e.context),t instanceof Error){if(t.message.includes("API key")||t.message.includes("authentication"))throw Error("OpenAI API 키 인증에 실패했습니다.");if(t.message.includes("rate limit"))throw Error("API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.");if(t.message.includes("network")||t.message.includes("fetch"))throw Error("네트워크 연결에 문제가 있습니다.")}throw Error(`문항 생성 중 오류가 발생했습니다: ${t instanceof Error?t.message:"알 수 없는 오류"}`)}}async contextAnswerRelevanceJudge(e){console.log("[AQG - CONTEXT-ANSWER JUDGE]");let t=i.ChatPromptTemplate.fromMessages([["system",`당신은 초등 영어 서술형 평가 문항과 채점 기준 개발 전문가입니다. 
다음은 생성된 평가 문항과 채점 기준(answer)이 검색된 문서(context)를 기반으로 작성되었는지 확인하는 평가입니다.

이 평가는 '문서 기반성(factual grounding)'과 '창의적 변형의 허용 범위'를 함께 고려해야 합니다.
형식, 구조, 평가 관점은 유지하되, 예시문이나 주제 등이 창의적으로 재구성되는 것은 허용됩니다.

다음의 4점 척도 기준에 따라 평가하세요:
1점: 생성된 대부분의 내용이 검색된 문서의 핵심 정보와 일치하지 않음. 문서와 무관한 주제나 구조가 다수 포함됨.
2점: 일부 요소는 문서 내용을 따르나, 핵심 평가 문항 구조 또는 기준이 왜곡되거나 근거 없이 크게 변경됨.
3점: 문서의 핵심 주제와 구조를 바탕으로 적절히 변형되었으며, 평가 목적과 형식은 대부분 유지됨.
4점: 문서의 핵심 정보와 평가 구조를 충실히 반영하면서도, 예시문 등에서 창의적으로 잘 변형되었음. 교육적으로 적절하고 실용적임.

점수는 숫자로만 반환하세요.`],["human","검색된 문서: {context} \n 생성된 평가 문항과 채점 기준: {answer}"]]),r=e.answer?JSON.stringify(e.answer,null,2):"",o=t.pipe(this.llmJudge).pipe(new u.StringOutputParser),n=await o.invoke({context:e.context,answer:r}),s=parseInt(n.match(/\d+/)?.[0]||"1");return console.log(`Context-Answer Relevance Score: ${s}`),s>=3?"finish":"hallucination"}async requestRewriterLowContext(e){console.log("[AQG - TRANSFORM REQUEST(low context)]");let t=i.ChatPromptTemplate.fromMessages([["system",`검색된 문서와 요청의 관련성이 낮습니다. 요청을 벡터 검색 시스템이 더 정확하게 문서를 검색할 수 있도록 다음과 같이 바꿔주세요:
- 요청의 핵심 주제와 목적을 명확하게 표현
- 불필요하거나 모호한 표현 제거
- 단원, 학년, 주제 키워드 강조
- 예시문 내용과 관련된 핵심 개념이 드러나도록

재작성된 요청은 문서 검색 정확도를 높이는 것을 목표로 합니다.`],["human","요청: {request}"]]).pipe(this.llmGen).pipe(new u.StringOutputParser);return e.request=await t.invoke({request:e.request}),e}async requestRewriterHighHallucination(e){console.log("[AQG - TRANSFORM REQUEST(high hallucination)]");let t=i.ChatPromptTemplate.fromMessages([["system",`생성된 평가 문항과 채점 기준이 검색된 문서에 제대로 기반하지 않았습니다. 
이 문제를 해결하기 위해, 요청을 다음과 같은 방향으로 바꿔주세요:
- 요청 목적을 더 구체적으로 설명
- 참고할 문서의 주제나 내용 키워드를 명확히 제시
- 예시문, 단원, 학년 등에서 반드시 포함되어야 하는 핵심 정보 포함

요청은 생성 결과가 문서에 충실하게 기초할 수 있도록 유도해야 합니다.`],["human","요청: {request}"]]).pipe(this.llmGen).pipe(new u.StringOutputParser);return e.request=await t.invoke({request:e.request}),e}async run(e){try{console.log("AQG Agent run 시작:",e),await this.initializeRetrieval(),console.log("Retrieval 초기화 완료");let t={request:e,context:""},r=0;for(;r<2;)try{console.log(`AQG 워크플로 시도 ${r+1}/2`),t=await this.retrieve(t),console.log("검색 단계 완료");try{let e=await this.requestContextRelevanceJudge(t);if(console.log("관련성 판단:",e),"not relevant"===e){t=await this.requestRewriterLowContext(t);continue}}catch(e){console.warn("관련성 판단 오류, 계속 진행:",e)}if(t=await this.generate(t),console.log("문항 생성 완료:",!!t.answer),t.answer)try{let e=await this.contextAnswerRelevanceJudge(t);if(console.log("환각 판단:",e),"finish"===e)break}catch(e){console.warn("환각 판단 오류, 생성된 결과 사용:",e);break}r++}catch(e){if(console.error(`AQG 워크플로 단계 ${r+1} 오류:`,e),++r>=2)try{if(console.log("간단한 문항 생성 시도"),(t=await this.generate(t)).answer){console.log("간단한 생성 성공");break}}catch(e){console.error("간단한 생성도 실패:",e)}}if(console.log("AQG 워크플로 완료, 결과:",!!t.answer),!t.answer)throw Error("문항 생성을 완료할 수 없습니다. 요청을 다시 확인해주세요.");return t.answer}catch(e){throw console.error("AQG Agent 전체 실행 오류:",e),Error(`문항 생성 중 오류가 발생했습니다: ${e instanceof Error?e.message:"알 수 없는 오류"}`)}}}let y="nodejs",f=60,E="force-dynamic";async function v(e){try{let t,r;console.log("문항 생성 요청 시작");let o=await e.json();console.log("요청 본문:",o);let{request:n,selectedGrade:s,selectedLesson:a}=o;if(!n)return console.error("요청 파라미터 누락:",o),l.Z.json({error:"요청(request)이 필요합니다."},{status:400});let c=n;if(s&&a&&(console.log("단원 정보 추가:",{selectedGrade:s,selectedLesson:a}),c=`${n}

[단원 정보]
- 학년: ${s}
- 단원: ${a}

이 단원의 학습 목표와 핵심 내용을 고려하여 적절한 난이도의 서술형 평가 문항을 생성해주세요.`),console.log("환경 변수 확인 중..."),console.log("OPENAI_API_KEY 존재:",!!process.env.OPENAI_API_KEY),console.log("OPENAI_API_KEY 길이:",process.env.OPENAI_API_KEY?.length||0),!process.env.OPENAI_API_KEY)return console.error("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다."),l.Z.json({error:"OpenAI API 키가 설정되지 않았습니다. 관리자에게 문의해주세요."},{status:500});let i="https://puajxghokhribumtxrby.supabase.co",u=process.env.SUPABASE_SERVICE_ROLE_KEY;console.log("Supabase 환경 변수 상태:",{NEXT_PUBLIC_SUPABASE_URL:!!i,SUPABASE_SERVICE_ROLE_KEY:!!u}),i&&u||console.warn("Supabase 환경 변수가 일부 누락되었습니다:",{NEXT_PUBLIC_SUPABASE_URL:!!i,SUPABASE_SERVICE_ROLE_KEY:!!u}),console.log("AQG 에이전트 초기화 시작");try{t=new w,console.log("AQG 에이전트 초기화 완료")}catch(e){return console.error("AQG 에이전트 초기화 실패:",e),l.Z.json({error:`AI 모델 초기화에 실패했습니다: ${e instanceof Error?e.message:"알 수 없는 오류"}`},{status:500})}console.log("AQG 에이전트 run 메서드 호출");try{r=await t.run(c),console.log("AQG 에이전트 실행 완료:",!!r)}catch(t){console.error("AQG 에이전트 실행 실패:",t);let e="AI가 문항 생성 중 오류가 발생했습니다.";return t instanceof Error&&(e=t.message,t.message.includes("API key")||t.message.includes("인증")?e="AI 서비스 인증에 문제가 있습니다.":t.message.includes("rate limit")||t.message.includes("사용량")?e="AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.":t.message.includes("network")||t.message.includes("네트워크")?e="AI 서비스 연결에 문제가 있습니다.":(t.message.includes("파싱")||t.message.includes("parsing"))&&(e="AI 응답 처리 중 오류가 발생했습니다. 다시 시도해주세요.")),l.Z.json({error:e},{status:500})}if(!r)return console.error("AQG 에이전트가 빈 결과를 반환했습니다."),l.Z.json({error:"AI가 문항을 생성하지 못했습니다."},{status:500});let _=["단원_및_학년","예시문","평가문항","조건"].filter(e=>!r[e]);if(_.length>0)return console.error("필수 필드 누락:",_,r),l.Z.json({error:`생성된 문항에 필수 정보가 누락되었습니다: ${_.join(", ")}`},{status:500});console.log("데이터베이스 저장 시작");try{if(!i||!u)return console.warn("Supabase 환경 변수가 누락되어 데이터베이스 저장을 건너뜁니다."),l.Z.json({success:!0,question:r,questionId:null,warning:"문항은 생성되었지만 데이터베이스 설정이 누락되어 저장되지 않았습니다."});let e=(0,d.B$)();console.log("Supabase 클라이언트 생성 완료");let{data:t,error:o}=await e.from("questions").insert({unit_grade:r.단원_및_학년,example_text:r.예시문,question:r.평가문항,conditions:r.조건,model_answer_1:r.모범_답안_1||"",model_answer_2:r.모범_답안_2||"",analytical_criteria_1:r.분석적_채점_기준_1||"",analytical_criteria_2:r.분석적_채점_기준_2||"",analytical_criteria_3:r.분석적_채점_기준_3||"",holistic_criteria_a:r.총체적_채점_기준_A||"",holistic_criteria_b:r.총체적_채점_기준_B||"",holistic_criteria_c:r.총체적_채점_기준_C||"",example_answer_a:r.성취수준별_예시_답안_A||"",example_answer_b:r.성취수준별_예시_답안_B||"",example_answer_c:r.성취수준별_예시_답안_C||"",feedback_a:r.성취수준별_평가에_따른_예시_피드백_A||"",feedback_b:r.성취수준별_평가에_따른_예시_피드백_B||"",feedback_c:r.성취수준별_평가에_따른_예시_피드백_C||""}).select().single();if(o)return console.error("문항 저장 오류:",o),l.Z.json({error:`문항 저장에 실패했습니다: ${o.message}`},{status:500});console.log("문항 저장 성공:",t);try{await e.from("evaluation_sessions").insert({request:n,generated_question_id:t.id,status:"generated"}),console.log("평가 세션 저장 완료")}catch(e){console.warn("평가 세션 저장 실패 (무시됨):",e)}return l.Z.json({success:!0,question:r,questionId:t.id})}catch(e){return console.error("데이터베이스 연동 오류:",e),l.Z.json({success:!0,question:r,questionId:null,warning:"문항은 생성되었지만 데이터베이스 저장에 실패했습니다."})}}catch(t){console.error("문항 생성 전체 오류:",t);let e="문항 생성에 실패했습니다.";return t instanceof Error&&(e=t.message,t.message.includes("API key")?e="OpenAI API 키 설정에 문제가 있습니다.":t.message.includes("network")||t.message.includes("fetch")?e="네트워크 연결에 문제가 있습니다.":t.message.includes("timeout")&&(e="요청 시간이 초과되었습니다. 다시 시도해주세요.")),l.Z.json({error:e,details:void 0},{status:500})}}let b=new n.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/generate-question/route",pathname:"/api/generate-question",filename:"route",bundlePath:"app/api/generate-question/route"},resolvedPagePath:"C:\\Users\\김민제\\Documents\\Dev\\aieewa\\app\\api\\generate-question\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:S,staticGenerationAsyncStorage:x,serverHooks:P,headerHooks:I,staticGenerationBailout:q}=b,C="/api/generate-question/route";function R(){return(0,a.patchFetch)({serverHooks:P,staticGenerationAsyncStorage:x})}},7399:(e,t,r)=>{r.d(t,{Hy:()=>u,eB:()=>c,yD:()=>i});var o=r(8775),n=r(8234);let s=null;function a(){if(!s){if(!process.env.OPENAI_API_KEY)throw Error("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.");s=new o.OpenAIEmbeddings({openAIApiKey:process.env.OPENAI_API_KEY,modelName:"text-embedding-3-small",batchSize:100})}return s}async function l(e){try{console.log(`${e.length}개 텍스트에 대한 임베딩 생성 시작`);let t=a(),r=await t.embedDocuments(e);return console.log(`임베딩 생성 완료: ${r.length}개 벡터`),r}catch(e){throw console.error("임베딩 생성 오류:",e),Error(`임베딩 생성에 실패했습니다: ${e instanceof Error?e.message:"알 수 없는 오류"}`)}}async function c(e){try{let t=a();return await t.embedQuery(e)}catch(e){throw console.error("단일 임베딩 생성 오류:",e),Error(`임베딩 생성에 실패했습니다: ${e instanceof Error?e.message:"알 수 없는 오류"}`)}}async function i(e,t=10,r=.7){try{let o=(0,n.B$)(),{data:s,error:a}=await o.from("document_chunks").select("chunk_text, metadata, embedding").not("embedding","is",null);if(a)return console.error("청크 조회 오류:",a),[];if(!s||0===s.length)return console.log("임베딩된 청크가 없습니다."),[];let l=s.map(t=>{if(!t.embedding||!Array.isArray(t.embedding))return{...t,similarity:0};let r=function(e,t){if(e.length!==t.length)throw Error("벡터 차원이 일치하지 않습니다.");let r=0,o=0,n=0;for(let s=0;s<e.length;s++)r+=e[s]*t[s],o+=e[s]*e[s],n+=t[s]*t[s];return 0===o||0===n?0:r/(Math.sqrt(o)*Math.sqrt(n))}(e,t.embedding);return{...t,similarity:r}}).filter(e=>e.similarity>=r).sort((e,t)=>t.similarity-e.similarity).slice(0,t);return console.log(`벡터 검색 결과: ${l.length}개 (임계값: ${r})`),l}catch(e){return console.error("벡터 검색 오류:",e),[]}}async function u(e,t){try{let r=(0,n.B$)(),o=Math.ceil(e.length/50);console.log(`${e.length}개 청크를 ${o}개 배치로 처리`);for(let n=0;n<e.length;n+=50){let s=e.slice(n,n+50),a=Math.floor(n/50)+1;console.log(`배치 ${a}/${o} 처리 중... (${s.length}개 청크)`);try{let e=s.map(e=>e.text),n=await l(e),c=s.map((e,r)=>({document_id:t,chunk_text:e.text,chunk_index:e.chunkIndex,metadata:e.metadata,embedding:n[r]})),{error:i}=await r.from("document_chunks").insert(c);i?console.error(`배치 ${a} 저장 오류:`,i):console.log(`배치 ${a} 저장 완료`),a<o&&await new Promise(e=>setTimeout(e,1e3))}catch(e){console.error(`배치 ${a} 처리 오류:`,e)}}console.log("모든 청크 임베딩 처리 완료")}catch(e){throw console.error("청크 임베딩 처리 오류:",e),e}}},8234:(e,t,r)=>{r.d(t,{B$:()=>n});var o=r(7385);function n(){let e="https://puajxghokhribumtxrby.supabase.co",t=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!t){let r=[];throw e||r.push("NEXT_PUBLIC_SUPABASE_URL"),t||r.push("SUPABASE_SERVICE_ROLE_KEY"),Error(`Missing Supabase environment variables: ${r.join(", ")}`)}return(0,o.eI)(e,t)}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[638,117,256],()=>r(2638));module.exports=o})();