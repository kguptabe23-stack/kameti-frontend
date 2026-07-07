import TokenJSON   from "../abi/KametiToken.json";
import FactoryJSON from "../abi/KametiFactory.json";
import PoolJSON    from "../abi/KametiPool.json";
import YieldJSON   from "../abi/KametiYield.json";

export const ADDRESSES = {
    token   : "0xbd11376e2Eaa66B6CA11d249181C471b890803A1",
    factory : "0x9F85d6ed462219d5a9A03e0254C83d0a422cf490",
    yield   : "0x8B7186DFa16DF6FCF6e10c8cff853956a7bFe5B8",
    usdc    : "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",

};

export const TOKEN_ABI   = TokenJSON.abi;
export const FACTORY_ABI = FactoryJSON.abi;
export const POOL_ABI    = PoolJSON.abi;
export const YIELD_ABI   = YieldJSON.abi;