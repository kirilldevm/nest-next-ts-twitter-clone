declare const configService: (() => {
    port: string | number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: string | number;
}>;
export default configService;
