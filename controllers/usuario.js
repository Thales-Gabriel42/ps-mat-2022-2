const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Usuario = require('../models/usuario');

const controller = {}; 

controller.create = async(req, res) => {
    try{

        // O usuário precisa ter passado um campo chamado
        // "senha"
        if(!req.body.senha) return res.status(500).send({
            message: "Um campo 'senha' seve ser fornacido"
        })

        // Encripta a senha aberta passada no campo "senha"
        // gerando o campo "hash_senha"
        req.body.hash_senha = await bcrypt.hash(req.body.senha, 12);

        // Apaga o campo "senha" para não disparar validação de 
        // Sequelize 
        delete req.body.senha;

        // Se o usuário logado não for admin, o valor do campo
        // admin do usuário que está sendo criado, não pode ser true
        if(req.infoLogado){
            if(!req.infoLogado?.admin) req.body.admin = false;
        }
        // Se não tiver o campo infoLogado no req, significa que
        // o acesso foi feito sem token. Nesse caso, também não
        // podemos criar um usuário admin
        else req.body.admin = false

        await Usuario.create(req.body)
        // HTTP 200 = OK (Implicito)
        res.status(201).end();

    }
    catch(error){
        console.error(error);
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

controller.retrieve = async(req, res) => {
    try{

        // Se o usuário logado não for admin, o único registro
        // retornado será o dele mesmo
        let result;
        if(req.infoLogado.admin){
            // Retorna todos os usuários cadastrados
            result = await Usuario.scope('semSenha').findAll();
        }
        else{
            // Não-admins só podem ter acesso ao próprio registro
            result = await Usuario.scope('semSenha').findAll({
                where: {id: req.infoLogado.id}
            });
        }
        //const result = await Usuario.scope("semSenha").findAll();
        // HTTP 200 = OK (Implicito)
        res.send(result);
    }
    catch(error){
        console.error(error);
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

controller.retrieveOne = async(req, res) => {
    try{

        // Usuários não-admins só podem ter acesso ao próprio registro
        if(!(req.infoLogado.admin) && req.infoLogado.id != req.params.id){
            // HTTP 403: Forbidden
            return res.sendStatus(403).end(); 
        }

        const result = await Usuario.scope('semSenha').findByPk(req.params.id);

        if(result) {
            // HTTP 200: OK (implícito)
            res.send(result)
        }
        else {
            // HTTP 404: Not found  
            res.status(404).end()
        }
    }
    catch(error){
        console.error(error);
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

controller.update = async(req, res) => {
    try{

        // Usuários não-admins só podem ter acesso ao próprio registro
        if(!(req.infoLogado.admin) && req.infoLogado.id != req.params.id){
            // HTTP 403: Forbidden
            return res.sendStatus(403).end(); 
        }

        // Se o campo "senha" existir em req.body,
        // precisamos gerar a versão criptografada
        // da mesma senha
        if(req.body.senha){
            req.body.hash_senha = bcrypt.hash(req.body.senha, 12);
            delete req.body.senha;
        }
        
        const response = await Usuario.update(
            req.body,
            // {where: {id: req.body.id}}
            {where: {id: req.params.id}}
            );
        // console.log("======>", {response})

        if(response[0] > 0) {  // Encontrou e atualizou
            // HTTP 204: No content
            res.status(204).end()
        }
        else {  // Não encontrou (e não atualizou)
            res.status(404).end()
        }
    }
    catch(error){
        console.error(error);
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

controller.delete = async(req, res) => {
    try{

        // Usuários não-admins só podem ter acesso ao próprio registro
        if(!(req.infoLogado.admin) && req.infoLogado.id != req.params.id){
            // HTTP 403: Forbidden
            return res.sendStatus(403).end(); 
        }

        const response = await Usuario.destroy(
            {where: {id: req.params.id}}
            );
        // console.log("======>", {response})

        if(response) {  // Encontrou e atualizou
            // HTTP 204: No content
            res.status(204).end()
        }
        else {  // Não encontrou (e não atualizou)
            res.status(404).end()
        }
    }
    catch(error){
        console.error(error);
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

controller.login = async(req, res) => {
    try{
        const usuario = await Usuario.findOne({ where: { email: req.body.email}})
        if(!usuario){// Usuário não existe
            // HTTP 401: Unauthorized
            res.status(401).send(error);
        }
        else{
            let senhaOk = await bcrypt.compare(req.body.senha, usuario.hash_senha);
            if(senhaOk){
                // Gera e retorna o token
                const token = jwt.sign(
                        {
                            id: usuario.id,
                            nome: usuario.nome,
                            email: usuario.enail,
                            admin: usuario.admin,
                            data_nasc: usuario.data_nasc
                        },
                        // { id: usuario.id},
                        process.env.TOKEN_SECRET,
                        {expiresIn: '8h'}
                )
                //HTTP 200: OK (Implícito)
                res.json({auth: true, token })
            }
            else{ // senha inválida
                // HTTP 401: Unauthorized
                res.status(401).end()
            }
        }
    }
    catch(error){
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

module.exports = controller;