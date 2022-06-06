import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const nomeCollection = 'veiculos'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * Validações
 * 
 **********************************************/
const validaVeiculo = [
    check('marca')
        .not().isEmpty().trim().withMessage('É obrigatório informar a marca do veiculo')
        .isLength({ min: 2 }).withMessage('A marca informada é muito curta. Informe ao menos 2 caracteres')
        .isLength({ max: 50 }).withMessage('A marca informada é muito longa. Informe no máximo 50 caracteres'),
    check('modelo')
        .not().isEmpty().trim().withMessage('É obrigatório informar o modelo')
        .isLength({ min: 2 }).withMessage('O nome do modelo é muito curto. Informe ao menos 2 caracteres')
        .isLength({ max: 100 }).withMessage('O nome do modelo é muito longo. Informe no máximo 100 caracteres'),
    check('cor')
        .not().isEmpty().trim().withMessage('É obrigatório informar a cor')
        .isLength({ min: 3 }).withMessage('O nome da cor é muito curta. Informe ao menos 4 caracteres')
        .isLength({ max: 100 }).withMessage('O nome da cor é muito longa. Informe no máximo 50 caracteres'),
    check('placa')
        .not().isEmpty().trim().withMessage('É obrigatório informar a placa')
        .matches(/[A-Za-z]{3}[0-9][0-9A-Za-z][0-9]{2}/).withMessage('A placa está errada. Exemplo: AAA9999'),
    check('renavam')
        .not().isEmpty().trim().withMessage('É obrigatório informar o renavam')
        .isNumeric().withMessage('O renavam só pode conter números')
        .isLength({ min: 9 }).withMessage('O renavam é muito curto. Informe ao menos 9 caracteres')
        .isLength({ max: 11 }).withMessage('O renavam é muito longo. Informe no máximo 11 caracteres')
]

/**********************************************
 * GET /api/veiculos
 **********************************************/
router.get('/', async (req, res) => {
    try {
        db.collection(nomeCollection).find({}, {
            projection: { senha: false }
        }).sort({ nome: 1 }).toArray((err, docs) => {
            if (!err) {
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({
            errors: [
                {
                    value: `${err.message}`,
                    msg: 'Erro ao obter a listagem dos veiculos',
                    param: '/'
                }
            ]
        })
    }
})

/**********************************************
 * GET /veiculos/id/:id
 **********************************************/
router.get("/id/:id", async (req, res) => {
    try {
        db.collection(nomeCollection).find({ "_id": { $eq: ObjectId(req.params.id) } }).toArray((err, docs) => {
            if (err) {
                res.status(400).json(err)
            } else {
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({ "error": err.message })
    }
})

/**********************************************
 * GET /veiculos/razao/:razao
 **********************************************/
router.get("/razao/:razao", async (req, res) => {
    try {
        db.collection(nomeCollection).find({ razao_social: { $regex: req.params.razao, $options: "i" } }).toArray((err, docs) => {
            if (err) {
                res.status(400).json(err)
            } else {
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({ "error": err.message })
    }
})

/**********************************************
 * POST /veiculos/
 **********************************************/
router.post('/', validaVeiculo, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
            .insertOne(req.body)
            .then(result => res.status(201).send(result))
            .catch(err => res.status(400).json(err))
    }
})

/**********************************************
 * PUT /veiculos
 * Alterar um veiculo pelo ID
 **********************************************/
router.put('/', validaVeiculo, async (req, res) => {
    let idDocumento = req.body._id
    delete req.body._id
    const schemaErrors = validationResult(req)
    if (!schemaErrors.isEmpty()) {
        return res.status(403).json(({
            errors: schemaErrors.array()
        }))
    } else {
        await db.collection(nomeCollection)
            .updateOne({ '_id': { $eq: ObjectId(idDocumento) } },
                { $set: req.body }
            )
            .then(result => res.status(202).send(result))
            .catch(err => res.status(400).json(err))
    }
})

/**********************************************
 * DELETE /veiculos/
 **********************************************/
router.delete('/:id', async (req, res) => {
    await db.collection(nomeCollection)
        .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
        .then(result => res.status(202).send(result))
        .catch(err => res.status(400).json(err))
})

export default router