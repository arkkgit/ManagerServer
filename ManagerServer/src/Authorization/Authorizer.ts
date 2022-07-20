import { TokenGenerator, Account, SessionToken, TokenValidator, TokenRights, TokenState } from "../Server/Model";
import { UserCredentialsDBAccess } from "./UserCredentialsDBAccess";
import { SessionTokenDBAccess } from "./SessionTokenDBAccess";
import { countInstances } from "../Shared/ObjectsCounter";
import { logInvocation } from "../Shared/MethodDecorators";


@countInstances
export class Authorizerwee implements TokenGenerator, TokenValidator {


    private userCredDBAccess: UserCredentialsDBAccess = new UserCredentialsDBAccess();
    private sessionTokenDBAccess: SessionTokenDBAccess = new SessionTokenDBAccess();

    @logInvocation
    async generateToken(account: Account): Promise<SessionToken | undefined> {
        const resultAccount = await this.userCredDBAccess.getUserCredential(
            { username: account.username, password: account.password }        )
        if (resultAccount) {
            const token: SessionToken = {
                accessRights: resultAccount.accessRights,
                expirationTime: this.generateExpirationTime(),
                username: resultAccount.username,
                valid: true,
                tokenId: this.generateRandomTokenId()
            }
            await this.sessionTokenDBAccess.storeSessionToken(token);
            return token;
        } else {
            return undefined;
        }
    }
/**
 * 
 * 
 * auth bug fix .... deleted
 */
    /**
     * 
     * @param tokenId 
     * @returns 
     */
    /**
 
     * @returns 
     */

    public async validateToken(tokenId: string): Promise<TokenRights> {
        const token = await this.sessionTokenDBAccess.getToken(tokenId);
        if (!token || !token.valid) {
            return {
                accessRights: [],
                state: TokenState.INVALID
            };
        } else if (token.expirationTime < new Date()) {
            return {
                accessRights: [],
                state: TokenState.EXPIRED
            };
        } return {
            accessRights: token.accessRights,
            state: TokenState.VALID
        }
    }

    private generateExpirationTime() {
        return new Date(Date.now() + 60 * 60 * 1000);
    }

    private generateRandomTokenId() {
        return Math.random().toString(36).slice(2);
    }

}