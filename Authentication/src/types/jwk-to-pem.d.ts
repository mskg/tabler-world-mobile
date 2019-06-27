declare module 'jwk-to-pem' {
    interface Options {
      private: boolean;
    }
  
    interface JwkEc {
      kty: 'EC';
      crv: string;
      d?: string;
      x?: string;
      y?: string;
    }
  
    interface JwkRsa {
      kty: 'RSA';
      e: string;
      n: string;
    }
  
    interface JwkRsaPrivate extends JwkRsa {
      d: string;
      p: string;
      q: string;
      dp: string;
      dq: string;
      qi: string;
    }
  
    type Jwk = JwkEc | JwkRsa | JwkRsaPrivate;
  
    export default function jwkToPem(jwk: Jwk, options?: Options): string;
  }