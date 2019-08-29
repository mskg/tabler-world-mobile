declare module "lambda-warmer" {
    function func (a: any): Promise<boolean>;
    export default func;
}