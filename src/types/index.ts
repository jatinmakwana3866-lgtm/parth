export type Language = 'en' | 'hi' | 'gu';
export type ScreenName = 'language'|'welcome'|'signup'|'roleSelect'|'profileSetup'|'welcomeGift'|'home'|'discover'|'profileView'|'chat'|'chatThread'|'tokenWallet'|'buyTokens'|'referEarn'|'myProfile'|'seoDashboard';
export interface FormData { name:string; email:string; password:string; businessName:string; city:string; }
export interface Role { id:string; icon:string; color:string; name:Record<Language,string>; desc:Record<Language,string>; }
export interface UserProfile { id:number; name:string; role:string; city:string; rating:number; reviews:number; available:boolean; unlocked:boolean; bio:string; }
export interface TokenPackage { name:string; price:number; tokens:number; badge:'BEST VALUE'|'DECOY'|null; highlight:boolean; }
export interface Transaction { id:number; type:'gift'|'spend'|'purchase'|'referral'; text:string; delta:string; time:string; }
