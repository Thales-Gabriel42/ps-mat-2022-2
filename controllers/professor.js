const Professor = require("../models/professor");

const controller = {};

controller.create = async(req, res) => {
    try{
        await Professor.create(req.body);
        res.status(201).end();
    }
    catch(error){
        console.error(error);
        res.status(500).send(error);
    }
}

controller.retrieve = async(req, res) => {
    try{
        const result = await Professor.findAll();
        res.send(result);
    }
    catch(error){
        console.error(error);
        res.status(500).send(error);
    }
}

controller.retrieveOne = async(req, res) => {
    try{
        const result = await Professor.findByPk(req.params.id);

        if(result) {
            res.send(result)
        }
        else {
            res.status(404).end()
        }
    }
    catch(error){
        console.error(error);
        res.status(500).send(error);
    }
}

controller.update = async(req, res) => {
    try{
        const response = await Professor.update(
            req.body,
            {where: {id: req.params.id}}
            );

        if(response[0] > 0) { 
            res.status(204).end()
        }
        else { 
            res.status(404).end()
        }
    }
    catch(error){
        console.error(error);
        res.status(500).send(error);
    }
}

controller.delete = async(req, res) => {
    try{
        const response = await Professor.destroy(
            {where: {id: req.params.id}}
            );

        if(response) {
            res.status(204).end()
        }
        else { 
            res.status(404).end()
        }
    }
    catch(error){
        console.error(error);
        res.status(500).send(error);
    }
}

module.exports = controller;