import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        
        private jwtService: JwtService,
        private prisma: PrismaService,
        private mailService: MailService
      ){}

    async register(data: { email: string; password: string; name: string }){

        try {
            const hashed = await bcrypt.hash(data.password, 10);
            const verifyToken = uuidv4();
            const user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    password: hashed,
                    name: data.name,
                    isAdmin: false
                }
            });
            console.log('User created:', user);
            return  this.signUser(user);
        } catch (error) {
           
            throw new InternalServerErrorException('Registration failed');
        }

    }  

    async login(email:string , password:string){
        const user = await this.prisma.user.findUnique({where:{email}})
        if(!user || !await bcrypt.compare(password,user.password )){

            throw new UnauthorizedException("Invalid Credntials")
        }
        return this.signUser(user)
    }

    private signUser(user:any){
        const payload = {sub:user.id , email:user.email , isAdmin:user.isAdmin , name:user.name}
       try {
        return{
            token:  this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
              },

        }
        
       } catch (error) {
        console.log("SIGNIN" , error)
       }
     
    }
}
