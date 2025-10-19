"use strict";(()=>{var e={};e.id=867,e.ids=[867],e.modules={9415:e=>{e.exports=require("@langchain/core/output_parsers")},6666:e=>{e.exports=require("@langchain/core/prompts")},8775:e=>{e.exports=require("@langchain/openai")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},5477:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},7310:e=>{e.exports=require("url")},9796:e=>{e.exports=require("zlib")},9901:(e,t,r)=>{r.r(t),r.d(t,{headerHooks:()=>y,originalPathname:()=>C,patchFetch:()=>R,requestAsyncStorage:()=>q,routeModule:()=>x,serverHooks:()=>b,staticGenerationAsyncStorage:()=>A,staticGenerationBailout:()=>f});var o={};r.r(o),r.d(o,{POST:()=>g,dynamic:()=>v,maxDuration:()=>w,runtime:()=>d});var a=r(5419),s=r(9108),n=r(9678),i=r(8070),_=r(8775),c=r(6666),u=r(9415),l=r(5256);let p=l.Ry({단원_및_학년:l.Z_().describe("단원과 학년"),예시문:l.Z_().describe("평가에 사용할 예시문"),평가문항:l.Z_().describe("서술형 평가 문항"),조건:l.Z_().describe("서술형 평가 문항 조건"),모범_답안_1:l.Z_().describe("모범 답안 1"),모범_답안_2:l.Z_().describe("모범 답안 2"),분석적_채점_기준_1:l.Z_().describe("답안에 대한 분석적 채점 기준 1의 점수와 점수별 예상 수행"),분석적_채점_기준_2:l.Z_().describe("답안에 대한 분석적 채점 기준 2의 점수와 점수별 예상 수행"),분석적_채점_기준_3:l.Z_().describe("답안에 대한 분석적 채점 기준 3의 점수와 점수별 예상 수행"),총체적_채점_기준_A:l.Z_().describe("총체적 채점 기준의 A 수준"),총체적_채점_기준_B:l.Z_().describe("총체적 채점 기준의 B 수준"),총체적_채점_기준_C:l.Z_().describe("총체적 채점 기준의 C 수준"),성취수준별_예시_답안_A:l.Z_().describe("성취 수준에 따른 A 수준의 예시 답안"),성취수준별_예시_답안_B:l.Z_().describe("성취 수준에 따른 B 수준의 예시 답안"),성취수준별_예시_답안_C:l.Z_().describe("성취 수준에 따른 C 수준의 예시 답안"),성취수준별_평가에_따른_예시_피드백_A:l.Z_().describe("답안 평가에 따른 A 수준의 예시 피드백"),성취수준별_평가에_따른_예시_피드백_B:l.Z_().describe("답안 평가에 따른 B 수준의 예시 피드백"),성취수준별_평가에_따른_예시_피드백_C:l.Z_().describe("답안 평가에 따른 C 수준의 예시 피드백")});l.Ry({score:l.Rx().min(1).max(4).describe("1~4")}),l.Ry({score:l.Rx().min(1).max(4).describe("1~4")}),process.env.OPENAI_API_KEY=process.env.OPENAI_API_KEY;class m{constructor(){this.llmGen=new _.ChatOpenAI({modelName:"gpt-4o",temperature:.3,openAIApiKey:process.env.OPENAI_API_KEY}),this.llmJudge=new _.ChatOpenAI({modelName:"gpt-4o",temperature:0,openAIApiKey:process.env.OPENAI_API_KEY}),this.parser=p}async initializeRetrieval(){this.retrieval={invoke:async()=>[]}}getPromptTemplate(){let e=[{context:"context",request:"5학년 10단원 영어 서술형 평가 문항과 채점 기준을 생성해줘.",answer:`예시문: Food Festival
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

성취수준별 평가에 따른 예시 피드백 C: 자신이 계획한 행사가 어떤 것인지에 대한 정보가 부족합니다. 초대하는 글에 들어가는 행사 이름, 날짜와 시간, 장소, 할 일에 대한 어휘를 학습하고 문장으로 쓰는 연습을 해 보세요. 그림과 함께 있는 쉽고 간단한 초대 글을 찾아 읽기를 추천합니다.`}],t=new c.PromptTemplate({inputVariables:["context","request","answer"],template:"context: {context} \n request: {request} \n answer: {answer}"});return new c.FewShotPromptTemplate({examples:e,examplePrompt:t,prefix:`당신은 초등 영어 서술형 평가 문항 및 채점 기준을 전문적으로 개발하는 평가 전문가입니다. 
당신의 역할은 예시와 검색된 문서 내용을 바탕으로, 초등학생 수준에 적합하고 교육과정에 부합하는 평가 문항과 채점 기준을 생성하는 것입니다. 
문항과 채점 기준은 다음과 같은 조건을 충족해야 합니다: 
1) 사용되는 어휘와 문장 구성은 교과서 수준과 유사해야 합니다. 
2) 예시문이나 모범 답안의 주제나 내용은 창의적이고 초등학생이 흥미를 가질 수 있는 것이어야 합니다. 
3) 평가 문항과 채점 기준은 내용 타당도가 높도록 구성되어야 하며, 교육과정 성취기준에 부합해야 합니다. 
이러한 조건을 바탕으로, 적절한 평가 문항과 채점 기준을 생성해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "단원_및_학년": "단원과 학년",
  "예시문": "평가에 사용할 예시문",
  "평가문항": "서술형 평가 문항",
  "조건": "서술형 평가 문항 조건",
  "모범_답안_1": "모범 답안 1",
  "모범_답안_2": "모범 답안 2",
  "분석적_채점_기준_1": "답안에 대한 분석적 채점 기준 1의 점수와 점수별 예상 수행",
  "분석적_채점_기준_2": "답안에 대한 분석적 채점 기준 2의 점수와 점수별 예상 수행",
  "분석적_채점_기준_3": "답안에 대한 분석적 채점 기준 3의 점수와 점수별 예상 수행",
  "총체적_채점_기준_A": "총체적 채점 기준의 A 수준",
  "총체적_채점_기준_B": "총체적 채점 기준의 B 수준",
  "총체적_채점_기준_C": "총체적 채점 기준의 C 수준",
  "성취수준별_예시_답안_A": "성취 수준에 따른 A 수준의 예시 답안",
  "성취수준별_예시_답안_B": "성취 수준에 따른 B 수준의 예시 답안",
  "성취수준별_예시_답안_C": "성취 수준에 따른 C 수준의 예시 답안",
  "성취수준별_평가에_따른_예시_피드백_A": "답안 평가에 따른 A 수준의 예시 피드백",
  "성취수준별_평가에_따른_예시_피드백_B": "답안 평가에 따른 B 수준의 예시 피드백",
  "성취수준별_평가에_따른_예시_피드백_C": "답안 평가에 따른 C 수준의 예시 피드백"
}

아래는 평가 문항과 채점 기준 예시입니다.:`,suffix:"context: {context} \n request: {request} \n answer:",inputVariables:["context","request"]})}async retrieve(e){console.log("[AQG - RETRIEVE]"),this.retrieval||await this.initializeRetrieval();let t=await this.retrieval.invoke(e.request);return e.context=t.map(e=>e.pageContent).join("\n\n"),e}async requestContextRelevanceJudge(e){console.log("[AQG - REQUEST-CONTEXT JUDGE]");let t=c.ChatPromptTemplate.fromMessages([["system",`당신은 초등 영어 서술형 평가 문항과 채점 기준 개발 전문가입니다.
다음은 교사의 요청(request)이 있고, 이를 위해 검색된 문서(context)가 주어졌습니다.

요청과 문서의 관련성을 다음의 4점 척도를 기준으로 평가하세요:
1점: 관련성이 매우 낮음 - 문서 내용이 요청과 전혀 무관하거나 관련성이 매우 낮음
2점: 관련성이 낮음 - 문서 내용이 요청한 내용과 일부 관련이 있으나, 핵심적인 정보나 세부 사항이 부족함
3점: 관련성이 높음 - 문서 내용이 요청한 내용과 대부분 관련이 있으며, 주요 정보와 세부 사항을 포함하고 있음
4점: 관련성이 매우 높음 - 문서 내용이 요청한 내용과 완전히 일치하며, 요청한 모든 정보와 세부 사항을 포괄적으로 제공함

점수는 숫자로만 반환하세요.`],["human","요청: {request} \n 검색된 문서: {context}"]]).pipe(this.llmJudge).pipe(new u.StringOutputParser),r=await t.invoke({request:e.request,context:e.context}),o=parseInt(r.match(/\d+/)?.[0]||"1");return console.log(`Request-Context Relevance Score: ${o}`),o>=3?"relevant":"not relevant"}async generate(e){console.log("[AQG - GENERATE]");let t=this.getPromptTemplate().pipe(this.llmGen).pipe(new u.StringOutputParser),r=await t.invoke({context:e.context,request:e.request});try{let t=r.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim(),o=JSON.parse(t);e.answer=p.parse(o)}catch(e){throw console.error("JSON 파싱 실패:",e),Error("생성된 답안을 파싱할 수 없습니다.")}return e}async contextAnswerRelevanceJudge(e){console.log("[AQG - CONTEXT-ANSWER JUDGE]");let t=c.ChatPromptTemplate.fromMessages([["system",`당신은 초등 영어 서술형 평가 문항과 채점 기준 개발 전문가입니다. 
다음은 생성된 평가 문항과 채점 기준(answer)이 검색된 문서(context)를 기반으로 작성되었는지 확인하는 평가입니다.

이 평가는 '문서 기반성(factual grounding)'과 '창의적 변형의 허용 범위'를 함께 고려해야 합니다.
형식, 구조, 평가 관점은 유지하되, 예시문이나 주제 등이 창의적으로 재구성되는 것은 허용됩니다.

다음의 4점 척도 기준에 따라 평가하세요:
1점: 생성된 대부분의 내용이 검색된 문서의 핵심 정보와 일치하지 않음. 문서와 무관한 주제나 구조가 다수 포함됨.
2점: 일부 요소는 문서 내용을 따르나, 핵심 평가 문항 구조 또는 기준이 왜곡되거나 근거 없이 크게 변경됨.
3점: 문서의 핵심 주제와 구조를 바탕으로 적절히 변형되었으며, 평가 목적과 형식은 대부분 유지됨.
4점: 문서의 핵심 정보와 평가 구조를 충실히 반영하면서도, 예시문 등에서 창의적으로 잘 변형되었음. 교육적으로 적절하고 실용적임.

점수는 숫자로만 반환하세요.`],["human","검색된 문서: {context} \n 생성된 평가 문항과 채점 기준: {answer}"]]),r=e.answer?JSON.stringify(e.answer,null,2):"",o=t.pipe(this.llmJudge).pipe(new u.StringOutputParser),a=await o.invoke({context:e.context,answer:r}),s=parseInt(a.match(/\d+/)?.[0]||"1");return console.log(`Context-Answer Relevance Score: ${s}`),s>=3?"finish":"hallucination"}async requestRewriterLowContext(e){console.log("[AQG - TRANSFORM REQUEST(low context)]");let t=c.ChatPromptTemplate.fromMessages([["system",`검색된 문서와 요청의 관련성이 낮습니다. 요청을 벡터 검색 시스템이 더 정확하게 문서를 검색할 수 있도록 다음과 같이 바꿔주세요:
- 요청의 핵심 주제와 목적을 명확하게 표현
- 불필요하거나 모호한 표현 제거
- 단원, 학년, 주제 키워드 강조
- 예시문 내용과 관련된 핵심 개념이 드러나도록

재작성된 요청은 문서 검색 정확도를 높이는 것을 목표로 합니다.`],["human","요청: {request}"]]).pipe(this.llmGen).pipe(new u.StringOutputParser);return e.request=await t.invoke({request:e.request}),e}async requestRewriterHighHallucination(e){console.log("[AQG - TRANSFORM REQUEST(high hallucination)]");let t=c.ChatPromptTemplate.fromMessages([["system",`생성된 평가 문항과 채점 기준이 검색된 문서에 제대로 기반하지 않았습니다. 
이 문제를 해결하기 위해, 요청을 다음과 같은 방향으로 바꿔주세요:
- 요청 목적을 더 구체적으로 설명
- 참고할 문서의 주제나 내용 키워드를 명확히 제시
- 예시문, 단원, 학년 등에서 반드시 포함되어야 하는 핵심 정보 포함

요청은 생성 결과가 문서에 충실하게 기초할 수 있도록 유도해야 합니다.`],["human","요청: {request}"]]).pipe(this.llmGen).pipe(new u.StringOutputParser);return e.request=await t.invoke({request:e.request}),e}async run(e){await this.initializeRetrieval();let t={request:e,context:""},r=0;for(;r<3;)try{t=await this.retrieve(t);let e=await this.requestContextRelevanceJudge(t);if("not relevant"===e){t=await this.requestRewriterLowContext(t);continue}t=await this.generate(t);let o=await this.contextAnswerRelevanceJudge(t);if("finish"===o)break;t=await this.requestRewriterHighHallucination(t),r++}catch(e){console.error("AQG 워크플로 오류:",e),r++}if(!t.answer)throw Error("문항 생성을 완료할 수 없습니다.");return t.answer}}var h=r(8234);let d="nodejs",w=60,v="force-dynamic";async function g(e){try{let{request:t}=await e.json();if(!t)return i.Z.json({error:"요청(request)이 필요합니다."},{status:400});let r=new m,o=await r.run(t),a=(0,h.B$)(),{data:s,error:n}=await a.from("questions").insert({unit_grade:o.단원_및_학년,example_text:o.예시문,question:o.평가문항,conditions:o.조건,model_answer_1:o.모범_답안_1,model_answer_2:o.모범_답안_2,analytical_criteria_1:o.분석적_채점_기준_1,analytical_criteria_2:o.분석적_채점_기준_2,analytical_criteria_3:o.분석적_채점_기준_3,holistic_criteria_a:o.총체적_채점_기준_A,holistic_criteria_b:o.총체적_채점_기준_B,holistic_criteria_c:o.총체적_채점_기준_C,example_answer_a:o.성취수준별_예시_답안_A,example_answer_b:o.성취수준별_예시_답안_B,example_answer_c:o.성취수준별_예시_답안_C,feedback_a:o.성취수준별_평가에_따른_예시_피드백_A,feedback_b:o.성취수준별_평가에_따른_예시_피드백_B,feedback_c:o.성취수준별_평가에_따른_예시_피드백_C}).select().single();if(n)return console.error("문항 저장 오류:",n),i.Z.json({error:"문항 저장에 실패했습니다."},{status:500});return await a.from("evaluation_sessions").insert({request:t,generated_question_id:s.id,status:"generated"}),i.Z.json({success:!0,question:o,questionId:s.id})}catch(e){return console.error("문항 생성 오류:",e),i.Z.json({error:"문항 생성에 실패했습니다."},{status:500})}}let x=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/generate-question/route",pathname:"/api/generate-question",filename:"route",bundlePath:"app/api/generate-question/route"},resolvedPagePath:"C:\\Users\\bmm04\\Dev\\aieewa\\app\\api\\generate-question\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:q,staticGenerationAsyncStorage:A,serverHooks:b,headerHooks:y,staticGenerationBailout:f}=x,C="/api/generate-question/route";function R(){return(0,n.patchFetch)({serverHooks:b,staticGenerationAsyncStorage:A})}},8234:(e,t,r)=>{r.d(t,{B$:()=>a});var o=r(7385);function a(){let e=process.env.NEXT_PUBLIC_SUPABASE_URL,t=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!t)throw Error("Missing Supabase environment variables");return(0,o.eI)(e,t)}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[638,117,256],()=>r(9901));module.exports=o})();