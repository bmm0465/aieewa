"use strict";(()=>{var e={};e.id=188,e.ids=[188],e.modules={9415:e=>{e.exports=require("@langchain/core/output_parsers")},6666:e=>{e.exports=require("@langchain/core/prompts")},8775:e=>{e.exports=require("@langchain/openai")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},5477:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},7310:e=>{e.exports=require("url")},9796:e=>{e.exports=require("zlib")},6988:(e,a,r)=>{r.r(a),r.d(a,{headerHooks:()=>q,originalPathname:()=>P,patchFetch:()=>C,requestAsyncStorage:()=>b,routeModule:()=>v,serverHooks:()=>f,staticGenerationAsyncStorage:()=>A,staticGenerationBailout:()=>g});var t={};r.r(t),r.d(t,{POST:()=>y,dynamic:()=>x,maxDuration:()=>w,runtime:()=>h});var i=r(5419),s=r(9108),n=r(9678),c=r(8070),o=r(8775),l=r(6666),_=r(9415),u=r(5256);let p=u.Ry({analytical_score_1:u.Rx().min(0).max(2).describe("분석적 채점 1 (과제수행: 내용의 적절성 및 완성도)"),analytical_score_2:u.Rx().min(0).max(2).describe("분석적 채점 2 (구성: 응집성 및 일관성)"),analytical_score_3:u.Rx().min(0).max(2).describe("분석적 채점 3 (언어사용: 어휘 및 어법의 정확성)"),holistic_score:u.Km(["A","B","C"]).describe("총체적 채점 수준"),total_score:u.Rx().min(0).max(6).describe("총점 (6점 만점)"),ai_feedback:u.Z_().describe("AI 피드백")});class m{constructor(){this.llm=new o.ChatOpenAI({modelName:"gpt-4o",temperature:.1,openAIApiKey:process.env.OPENAI_API_KEY})}async evaluateAnswer(e,a,r){let t=l.ChatPromptTemplate.fromMessages([["system",`당신은 초등 영어 평가 전문가입니다. 
주어진 평가 문항과 채점 기준을 바탕으로 학생의 서술형 답안을 평가하세요.

평가 기준:
1. 분석적 채점 기준 3개 영역 (각 0-2점, 총 6점 만점)
2. 총체적 채점 기준 (A, B, C 수준)

다음 JSON 형식으로 응답해주세요:
{
  "analytical_score_1": 0-2,
  "analytical_score_2": 0-2, 
  "analytical_score_3": 0-2,
  "holistic_score": "A" 또는 "B" 또는 "C",
  "total_score": 0-6,
  "ai_feedback": "개별화된 피드백 메시지"
}`],["human",`
평가 문항: {question}
조건: {conditions}
학생 답안: {studentAnswer}
학생 이름: {studentName}

분석적 채점 기준:
1. {analytical_criteria_1}
2. {analytical_criteria_2}
3. {analytical_criteria_3}

총체적 채점 기준:
A 수준: {holistic_criteria_a}
B 수준: {holistic_criteria_b}
C 수준: {holistic_criteria_c}

성취수준별 예시 답안:
A 수준: {example_answer_a}
B 수준: {example_answer_b}  
C 수준: {example_answer_c}
`]]).pipe(this.llm).pipe(new _.StringOutputParser),i=await t.invoke({question:e.question,conditions:e.conditions,studentAnswer:a,studentName:r,analytical_criteria_1:e.analytical_criteria_1,analytical_criteria_2:e.analytical_criteria_2,analytical_criteria_3:e.analytical_criteria_3,holistic_criteria_a:e.holistic_criteria_a,holistic_criteria_b:e.holistic_criteria_b,holistic_criteria_c:e.holistic_criteria_c,example_answer_a:e.example_answer_a,example_answer_b:e.example_answer_b,example_answer_c:e.example_answer_c});try{let e=i.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim(),a=JSON.parse(e);return p.parse(a)}catch(e){throw Error("평가 결과를 파싱할 수 없습니다.")}}}var d=r(8234);let h="nodejs",w=60,x="force-dynamic";async function y(e){try{let{questionId:a,studentName:r,answer:t}=await e.json();if(!a||!r||!t)return c.Z.json({error:"필수 필드가 누락되었습니다."},{status:400});let i=(0,d.B$)(),{data:s,error:n}=await i.from("questions").select("*").eq("id",a).single();if(n||!s)return c.Z.json({error:"문항을 찾을 수 없습니다."},{status:404});let o=new m,l=await o.evaluateAnswer(s,t,r),{data:_,error:u}=await i.from("student_answers").insert({question_id:a,student_name:r,answer:t,analytical_score_1:l.analytical_score_1,analytical_score_2:l.analytical_score_2,analytical_score_3:l.analytical_score_3,holistic_score:l.holistic_score,total_score:l.total_score,ai_feedback:l.ai_feedback}).select().single();if(u)return c.Z.json({error:"답안 저장에 실패했습니다."},{status:500});return c.Z.json({success:!0,evaluation:l,answerId:_.id})}catch(e){return c.Z.json({error:"답안 평가에 실패했습니다."},{status:500})}}let v=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/evaluate-answer/route",pathname:"/api/evaluate-answer",filename:"route",bundlePath:"app/api/evaluate-answer/route"},resolvedPagePath:"C:\\Users\\bmm04\\Dev\\aieewa\\app\\api\\evaluate-answer\\route.ts",nextConfigOutput:"",userland:t}),{requestAsyncStorage:b,staticGenerationAsyncStorage:A,serverHooks:f,headerHooks:q,staticGenerationBailout:g}=v,P="/api/evaluate-answer/route";function C(){return(0,n.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:A})}},8234:(e,a,r)=>{r.d(a,{B$:()=>i});var t=r(7385);function i(){let e=process.env.NEXT_PUBLIC_SUPABASE_URL,a=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!a)throw Error("Missing Supabase environment variables");return(0,t.eI)(e,a)}}};var a=require("../../../webpack-runtime.js");a.C(e);var r=e=>a(a.s=e),t=a.X(0,[638,117,256],()=>r(6988));module.exports=t})();