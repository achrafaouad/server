const express = require('express');
const bodyParser = require('body-Parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const multer = require('multer');
var path = require('path');

//const upload = multer({dest:'uploads/'})
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null,path.join(__dirname,'/uploads'))
    },
    filename: function(req, file, cb) {
        cb(null,Date.now() + path.extname(file.originalname))
      
    }
  });
  
  const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  });

const knex = require('knex');
const postgres = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'test',
      database : 'my_App'
    }
  });
const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use('/uploads', express.static('uploads'));

// default options

const database = {
    users:[
        {
            id:'1',
            name:'achraf',
            email:'achrafaouad1@gmail.com',
            password:"1234"
        },{
            id:'2',
            name:'marwa',
            email:'achrafaouad2@gmail.com',
        },
        {
            id:'3',
            name:'ahmed',
            email:'achrafaouad3@gmail.com',
        }
    ],
    register: [
        {
            email:"achrafaouad1@gmail.com",
            password:""
        },
        {
            email:"achrafaouad2@gmail.com",
            password:""
        },
        {
            email:"achrafaouad3@gmail.com",
            password:""
        }
    ]
};

app.get('/',(req, res)=>{
    res.json(database)
})

app.post('/signin',(req, res)=>{
    postgres('exploiteur').where(function() {
        this.where('email', req.body.email)
      }).then(
          data => {
            bcrypt.compare(req.body.password, data[0].password, function(err, resp) {
                if(resp){
                    return res.json(data[0])
                }
            });
            })

    
    })

    app.post('/get_foncier',(req, res)=>{
        //postgres('foncier').select(postgres.raw('ST_AsGeoJSON(??) AS geometry', ['foncier.geometry'])).where('id_foncier',41).then(data => res.send(data));
        // postgres('foncier').where({
        //     id_foncier:39,
        //   }).select('geometry').then((data)=>{res.send(data)})
        postgres('foncier').select('id_foncier','id_exp','nom','surface',postgres.raw('ST_AsGeoJSON(??) AS geometry', ['foncier.geometry'])).where('id_exp',req.body.id).then(data => res.send(data));
               })


app.post('/register',(req, res)=>{
    const {email,password,name,country} = req.body;
    bcrypt.hash(password, null, null, function(err, hash) {
        
    postgres('exploiteur').insert({
             nom:name,
            email:email,
            password:hash,
            pays:country
    }).then(console.log)
    });
    res.json(database.users)
    })

app.get('/profile/:id' , (req ,res)=>{
    database.users.forEach(user =>{
        if(user.id === req.params.id){
            res.json(user)
        }
        else{
            res.status(404).json("not found")
        }
    
    })
        
})

app.post('/add_foncier', (req,res)=>{
console.log("lolo")
const {nom,surface,geometry,id_exp,prix_achat,date_achat,prix_loue,proprietaire,date_loue} = req.body;
let object = {
    nom:nom,
    surface:surface,
    geometry:geometry,
    id_exp:id_exp,
} 
console.log(geometry)

let path = 'foncier';
console.log(prix_achat)
if(prix_achat){
     object["date_achat"] = date_achat;
     object["prix_achat"] = prix_achat;
      path = 'foncier_disposé'
      console.log(path)
 
    };

if(prix_loue){
     object["prix_loue"] = prix_loue;
     object["proprietaire"] = proprietaire;
     object["date_loue"] = date_loue;
      path = 'foncier_loué'
      console.log(path)
 
    };console.log(path)

                            
postgres(path).insert(object,'id_foncier').then((data)=>{console.log(data[0]);res.json({data:data[0]})})
    
} )





   app.post('/add_statut',(req,res)=>{
    const {nom , date_changement } = req.body;
   
    let object = {
       nom:nom,
       date_changement:date_changement
    }
       postgres("statut").insert(object).then(res.send("success")).then(console.log)
      
   })


   

  


   app.post('/add_aliment',(req,res)=>{
    const {nom,quantite,date_achat,note,fournisseur,prix_unit,unit} = req.body;

    let object = {
        nom:nom,
        quantite:quantite,
        date_achat:date_achat,
        note:note,
        fournisseur:fournisseur,
        prix_unit:prix_unit,
        unit:unit
    }

    let path = 'aliment';
       console.log(path);
       postgres(path).insert(object).then(res.send("success")).then(console.log)
   })

   


   app.post('/add_exploitation',(req,res)=>{
    const {nom,date_exploitation,id_foncier,batiment,note,errige,culture_permanent,source_eau} = req.body;

    let object = {
        nom:nom,
        date_exploitation:date_exploitation,
        id_foncier:id_foncier
    }
    console.log(batiment);
    console.log(errige);
    let path = 'exploitation';
    if(batiment == "true" || batiment == "false"){
        object["batiment"] = batiment;
        object["note"] = note; 
        path = 'exploitation_ann';
        console.log(path)
        };
    if(errige == true || errige == false){
        object["errige"] = errige;
        object["culture_permanent"] = culture_permanent; 
        object["source_eau"] = source_eau; 
        path = 'exploitation_veg';
        console.log(path)
        };
    
       console.log(path);
       postgres(path).insert(object).then(res.send("success")).then(console.log)
   })

   app.post('/add_traitement',(req,res)=>{
    const {operation ,cout} = req.body;

    let object = {
        operation:operation,
        cout:cout,
    }

    let path = 'traitement';
       console.log(path);
       postgres(path).insert(object).then(res.send("success")).then(console.log)
   })
   
   
   app.post('/add_travail',(req,res)=>{
    const {nom,type,prix} = req.body;

    let object = {
        nom:nom,
        type:type,
        prix:prix
        
    }
    let path = 'travail';
       console.log(path);
       postgres(path).insert(object).then(res.send("success")).then(console.log)
   })

   //faire les traitement a partire de cette ligne 

   


  



   

   
  


  
   app.post('/composer',(req,res)=>{
    const {id_ali , id_aliment, ratio} = req.body;
    let object = {
        id_ali:id_ali ,
        id_aliment:id_aliment,
        ratio:ratio
    }
    let path = 'comopser';
       console.log(path);
       postgres(path).insert(object).then(res.send("success")).then(console.log)
   })


   app.get('/getParcelles',(req,res)=>{
    postgres('foncier')
    .join('exploitation', 'foncier.id_foncier', 'exploitation.id_foncier')
    .join('exploiteur','foncier.id_exp','exploiteur.id')
    .select('foncier.id_foncier','exploitation.date_exploitation','foncier.surface','foncier.nom AS nomFoncier' ,'exploitation.nom','exploiteur.nom')
    .then(data=>{console.log(data);res.send(data)})
   })


   app.get('/getMateriel',(req,res)=>{
    postgres('materiel')
    .select().then(data=>{console.log(data);res.send(data)})

   })
   

   app.post('/add_materiel',(req,res)=>{
    const {nom,description,fabriquant,image,model,immatriculation,id_type} = req.body;
    derniere_controle_tec = req.body.derniere_controle_tec;
    derniere_assurence = req.body.derniere_assurence;
    
    prix_achat = req.body.prix_achat;
    date_achat = req.body.date_achat;
    n_enregistrement = req.body.n_enregistrement;


    prix_location_jour = req.body.prix_location;
    propriétaire = req.body.propriétaire;
    
    

    let object = {
        nom:nom,
        description:description,
        fabriquant:fabriquant,
        image:image,
        model:model,
        immatriculation:immatriculation,
        id_type:id_type
    }
    let path = 'materiel';
    if(derniere_controle_tec){
         object["derniere_controle_tec"] = derniere_controle_tec;
         object["derniere_assurence"] = derniere_assurence;
         object["prix_achat"] = prix_achat;
         object["date_achat"] = date_achat;
         object["n_enregistrement"] = n_enregistrement;
          path = 'materiel_acheté' 
        };
    if(prix_location_jour){
         object["prix_location_jour"] =prix_location_jour;
         object["propriétaire"] =propriétaire;
          path = 'materiel_loué' 
        };
   
   console.log(path)
       postgres(path).returning('id_mat').insert(object).then(data=> res.send({data:data[0]}))
   })


   app.post('/add_type',(req,res)=>{
    const {note} = req.body;
   
    let object = {
      
       note:note
    }
       postgres("type").insert(object).then(res.send("success")).then(console.log)
   })



   app.post('/upload', upload.single('materiel') , (req,res)=>{
       console.log(req.file)
       console.log(req.body.id)
       const Length = req.file.path.split('\\').length;
       const pathName = req.file.path.split('\\')[Length-2]+'\\' + req.file.path.split('\\')[Length-1]
       console.log(pathName)
       console.log(req.body.id)
       
        postgres('materiel').where({id_mat:req.body.id}).update({image:pathName}).then(res.json(pathName)).then(console.log)
       //postgres('materiel').returning('id_mat').insert({image:pathName}).then(data=> console.log({data:data[0]}))
       

   })


   app.post('/updateProfil',(req,res)=>{
    const {id,nom,adress,ville,pays,code_insee,note,cin,devise} = req.body;
    
    

    let object = {
        nom:nom,
        adress:adress,
        ville:ville,
        code_insee:code_insee,
        note:note,
        cin:cin,
        devise:devise,
        pays:pays
    }
    let path = 'exploiteur';
    
   
   console.log(path)
       postgres(path).returning('id').where({id:id}).update(object).then(data=> res.send({data:data[0]}))
   })
   

   app.post('/user',(req,res)=>{
    let path = 'exploiteur';
    postgres(path).where({id:req.body.id}).select().then(data=> res.send(data))
   })


   app.post('/password' , (req,res)=>{
    
    bcrypt.hash(req.body.password, null, null, function(err, hash) {
        postgres('exploiteur').where({id:req.body.id}).update({password:hash}).then(res.json(hash)).then(console.log)
    })
})
    
     
    //postgres('materiel').returning('id_mat').insert({image:pathName}).then(data=> console.log({data:data[0]}))
    

    app.get('/getExploitationAnimal',(req,res)=>{
        postgres('exploitation_ann')
        .join('foncier', 'exploitation_ann.id_foncier', 'foncier.id_foncier')
        .select("exploitation_ann.id_exploitation","exploitation_ann.nom","exploitation_ann.date_exploitation","exploitation_ann.id_foncier","exploitation_ann.note","exploitation_ann.batiment","foncier.surface","foncier.id_exp",postgres.raw('ST_AsGeoJSON(??) AS geometry', ['foncier.geometry']))
        .then(data=>{console.log(data);res.send(data)})
       })

       app.get('/getExploitationVeg',(req,res)=>{
        postgres('exploitation_veg')
        .join('foncier', 'exploitation_veg.id_foncier', 'foncier.id_foncier')
        .select("exploitation_veg.id_exploitation","exploitation_veg.nom","exploitation_veg.type_source_eau","exploitation_veg.distance_eau","exploitation_veg.vulnérable","exploitation_veg.certification","exploitation_veg.zone_spécifique","exploitation_veg.système_irrigation","exploitation_veg.nom","exploitation_veg.date_exploitation","exploitation_veg.id_foncier","exploitation_veg.note","exploitation_veg.culture_permanent","exploitation_veg.source_eau","exploitation_veg.errige","foncier.surface","foncier.id_exp",postgres.raw('ST_AsGeoJSON(??) AS geometry', ['foncier.geometry']))
        .then(data=>{console.log(data);res.send(data)})
       })

       app.get('/get_Exploitation',(req,res)=>{
        postgres('exploitation')
        .select()
        .then(data=>{console.log(data);res.send(data)})
       })

       
       
       app.post('/add_animal',(req,res)=>{
        const {gender,date_birth,race,sous_famille,note,prix,id_exploitation} = req.body;
    
        let object = {
            gender:gender,
            date_birth:date_birth,
            race:race,
            sous_famille:sous_famille,
            
            note:note,
            prix:prix,
            id_exploitation:id_exploitation,
            
        }
    
        let path = 'animal';
           console.log(path);
           postgres(path).insert(object).then(res.send("success")).then(console.log)
       })

       app.get('/aliment',(req,res)=>{
        
    
        let path = 'aliment';
        postgres("aliment").select()
        .then(data=>{console.log(data);res.send(data)})
       })


       app.post('/add_alimentation',(req,res)=>{
        const {id_aliment,quantité,date_alimentation,note,id_exploitation,duré,price} = req.body;
    
        let object = {
            id_aliment:id_aliment,
            quantité:quantité,
            id_exploitation:id_exploitation,
            note:note,
            duré:duré,
            date_alimentation:date_alimentation,
            price:price
        }
    
        let path = 'alimentation';
           console.log(path);
           postgres(path).insert(object).then(res.send("success")).then(console.log)
       })


       app.post('/getAnimal',(req,res)=>{
        id_exploitation = req.body.id_exploitation
        let path = 'aliment';
        postgres('animal').where({id_exploitation:req.body.id_exploitation}).select().then(data=>{console.log(data);res.send(data)})
      
        
       })

       app.post('/getEffectuerTrait',(req,res)=>{
        
        let path = 'aliment';
        postgres('effectuer_traitement').leftJoin('traitement', 'effectuer_traitement.id_trait', 'traitement.id_trait')
        .where({id_ann:req.body.id_ann}).select().then(data=>{console.log(data);res.send(data)})
       })

       app.post('/get_traitement',(req,res)=>{
        
        let path = 'aliment';
        postgres("traitement").select()
        .then(data=>{console.log(data);res.send(data)})
       })


       app.post('/effectuer_traitement',(req,res)=>{
        const {id_trait , id_ann, date_traitement,note,numero_bulletin ,veterinaire , cout} = req.body;
        let object = {
            id_trait:id_trait ,
            id_ann:id_ann,
            date_traitement:date_traitement,
            note:note,
            numero_bulletin:numero_bulletin,
            veterinaire:veterinaire,
            cout:cout
    
    
        }
        let path = 'effectuer_traitement';
           console.log(path);
           postgres(path).insert(object).then(res.send("success")).then(console.log)
       })
       app.post('/update_exploitationVeg',(req,res)=>{
        const {errige,source_eau,culture_permanent,note,date_exploitation,nom,type_source_eau,distance_eau,vulnérable,certification,zone_spécifique,système_irrigation,id_exploitation} = req.body;
        let object = {
            errige:errige,
            source_eau:source_eau,
            culture_permanent:culture_permanent,
            note:note,
            date_exploitation:date_exploitation,
            nom:nom,
            type_source_eau:type_source_eau,
            distance_eau:distance_eau,
            vulnérable:vulnérable,
            certification:certification,
            zone_spécifique:zone_spécifique,
            système_irrigation:système_irrigation,
    
        }
        let path = 'exploitation_veg';
           console.log(path);
           postgres('exploitation_veg').where({id_exploitation:id_exploitation}).update(object).then(res.json("pathName")).then(console.log)
       })


       


       app.get('/getPersonnel1',(req,res)=>{
        postgres('personnel')
        .select().then(data=>{console.log(data);res.send(data)})
    
       })

    

       app.get('/getEngrais',(req,res)=>{
        postgres('engrais')
        .select().then(data=>{console.log(data);res.send(data)})
    
       })

       app.get('/getmat144',(req,res)=>{
        postgres('materiel')
        .select().then(data=>{console.log(data);res.send(data)})
    
       })

       app.post('/add_personnel',(req,res)=>{
        const {nom,adress,ville,cin,pays,note,id_exp} = req.body;
        salaire_jr = req.body.salaire_jr;
        salaire_mois = req.body.salaire_mois;
        let object = {
           nom:nom,
           adress:adress,
           ville:ville,
           cin:cin,
           pays:pays,
           note:note,
           id_exp:id_exp
        }
        let path = 'personnel';
        if(salaire_jr){ object["salaire_jr"] = salaire_jr; path = 'pers_saisonnier' ;console.log(path) } ;
        if(salaire_mois){ object["salaire_mois"] =salaire_mois; path = 'pers_permanent';console.log(path) };
       
       console.log(path)
           postgres(path).returning('id_pers').insert(object).then(data=> res.send({data:data[0]}))
       })


       app.post('/uploadMypers', upload.single('materiel') , (req,res)=>{
        console.log(req.file)
        console.log(req.body.id)
        const Length = req.file.path.split('\\').length;
        const pathName = req.file.path.split('\\')[Length-2]+'\\' + req.file.path.split('\\')[Length-1]
        console.log(pathName)
        console.log(req.body.id)
        
         postgres('personnel').where({id_pers:req.body.id}).update({image:pathName}).then(res.json(pathName)).then(console.log)
        //postgres('materiel').returning('id_mat').insert({image:pathName}).then(data=> console.log({data:data[0]}))
        
 
    })


    app.post('/update_personnel',(req,res)=>{
        const {id_pers,nom,adress,ville,cin,pays,id_exp,VALIDE_DEPUIS,salaire_hr,salaire_mois,salaire_jr,tva,type,niveau_qualification,certiphyto,conseiller,email,téléphone,code_insee} = req.body;
        let object = {
            nom:nom,
            adress:adress,
            ville:ville,
            cin:cin,
            pays:pays,
            tva:tva,
            type:type,
            niveau_qualification:niveau_qualification,
            certiphyto:certiphyto,
            conseiller:conseiller,
            email:email,
            téléphone:téléphone,
            code_insee:code_insee,
            VALIDE_DEPUIS:VALIDE_DEPUIS,
            salaire_hr:salaire_hr
    
        }
        let path = 'personnel';
        if(salaire_mois){path = 'pers_permanent'; object["salaire_mois"] =salaire_mois ; console.log(path)};
        if(salaire_jr){path = 'pers_saisonnier'; object["salaire_jr"] =salaire_jr ; console.log(path)};


           console.log(path);
           postgres(path).where({id_pers:id_pers}).update(object).then(res.json("pathName")).then(console.log)
       })



       
    app.post('/updateMateriel',(req,res)=>{
        const {nom,VALIDE_DEPUIS,prix_hr,description,model,immatriculation,fabriquant,prix_location_jour,propriétaire,derniere_controle_tec,derniere_assurence,n_enregistrement} = req.body;
        let object = {
            nom:nom,
            description:description,
            model:model,
            immatriculation:immatriculation,
            fabriquant:fabriquant,
            VALIDE_DEPUIS:VALIDE_DEPUIS,
            prix_hr:prix_hr,
            
    
        }
        let path = 'materiel';
        if(prix_location_jour){path = 'materiel_loué'; object["prix_location_jour"] =prix_location_jour ;object["propriétaire"] =propriétaire ; console.log(path)};
        if(derniere_controle_tec || n_enregistrement || derniere_assurence){path = 'materiel_acheté'; object["derniere_controle_tec"] =derniere_controle_tec ; object["derniere_assurence"] =derniere_assurence ; object["n_enregistrement"] =n_enregistrement ;console.log(path)};


           console.log(path);
           postgres(path).where({id_mat:req.body.id}).update(object).then(res.json("pathName")).then(console.log)
       })

       app.get('/getPhyto',(req,res)=>{
        postgres('phytosantaire')
        .select().then(data=>{console.log(data);res.send(data)})
    
       })
       app.get('/getSemence',(req,res)=>{
        postgres('semence_plants')
        .select().then(data=>{console.log(data);res.send(data)})
    
       })
       app.get('/getEngrais',(req,res)=>{
        postgres('engrais')
        .select().then(data=>{console.log(data);res.send(data)})
    
       })
       app.get('/getTravail',(req,res)=>{
        postgres('travail')
        .select().then(data=>{console.log(data);res.send(data)})
    
       })
       app.post('/updateSemece144',(req,res)=>{
        const {prix_uni,VALIDE_DEPUIS,id_prod,nom,culture,unité} = req.body;
        let object = {
            prix_uni:prix_uni,
            VALIDE_DEPUIS:VALIDE_DEPUIS,
            nom:nom,
            unité:unité,
            culture:culture

        }
         let path = "semence_plants";
           console.log(path);
           postgres(path).where({id_prod:id_prod}).update(object).then(res.json("pathName")).then(console.log)
       })

       app.post('/updatePhytosantaire',(req,res)=>{
        const {prix_uni,unité,composition,n_enregistrement,fabriquant,VALIDE_DEPUIS,id_prod,nom,culture} = req.body;
        let object = {
            prix_uni:prix_uni,
            VALIDE_DEPUIS:VALIDE_DEPUIS,
            fabriquant:fabriquant,
            nom:nom,
            unité:unité,
            composition:composition,
            n_enregistrement:n_enregistrement
            

        }
         let path = "phytosantaire";
           console.log(path);
           postgres(path).where({id_prod:id_prod}).update(object).then(res.json("pathName")).then(console.log)
       })

       app.post('/updateEngrais',(req,res)=>{
        const {prix_uni,azot,Phosphore,unité,potassium,composition_n_oligo_elements,composition,n_enregistrement,fabriquantVALIDE_DEPUIS,id_prod,nom,culture} = req.body;
        let object = {
            prix_uni:prix_uni,
            VALIDE_DEPUIS:VALIDE_DEPUIS, 
            nom:nom,
            unité:unité,
            composition_n_oligo_elements:composition_n_oligo_elements,
            potassium:potassium,
            Phosphore:Phosphore,
            azot:azot,

        }
         let path = "engrais";
           console.log(path);
           postgres(path).where({id_prod:id_prod}).update(object).then(res.json("pathName")).then(console.log)
       })


       app.post('/add_produit',(req,res)=>{
        const {nom,unité,prix_uni,myProp, n_enregistrement,composition,fabriquant, culture, azote,phosphore,potassium,composition_n_oligo_elements} = req.body;
    
        let object = {
            nom:nom,
            unité:unité,
            prix_uni:prix_uni
        }
    
        let path = 'produit';
        if(myProp === "PHYTOSANITAIRES"){
             object["n_enregistrement"] = n_enregistrement;
             object["composition"] = composition;
             object["fabriquant"] = fabriquant;
              path = 'phytosantaire' 
            };
        if(myProp === "ENGRAIS"){
             object["azot"] = azote;
             object["Phosphore"] = phosphore;
             object["potassium"] = potassium;
             object["composition_n_oligo_elements"] = composition_n_oligo_elements;
              path = 'engrais' 
            };
        if(myProp === "SEMENCES/PLANTS"){
             object["culture"] =culture;
              path = 'semence_plants' 
            };
       
       console.log(path)
           postgres(path).insert(object).then(res.send("success")).then(console.log)
       })


       //todo

       app.post('/add_operation',(req,res)=>{
        const {duré,note,prix_totale,travaux} = req.body;
        let object ={
            duré:duré,
            note:note,
            prix_totale:prix_totale,
            travaux:travaux
        }
        postgres('operation').returning('id_operation').insert(object).then(data=> {res.send({data:data[0]}); console.log(data)}).catch(err => console.log(err))
       })

       app.post('/appliquer_operation',(req,res)=>{
        const {id_operation , id_exploitations , date_application} = req.body;
        
        
                    
            const fieldsToInsert = id_exploitations.map(field => 
            ({ id_operation: id_operation, id_exploitation:field , date_application: date_application })); 

            return postgres('appliquer_op').insert(fieldsToInsert).then(res.send("success")).then(console.log)
            

       })

       app.post('/utilise_produit',(req,res)=>{
        const {id_produits , quantite,id_operation} = req.body;

        const fieldsToInsert = id_produits.map((field, index) => 
            ({ id_operation: id_operation, id_prod:field , quantite:quantite[index] })); 
        
            return postgres('utilise_prod').insert(fieldsToInsert).then(res.send("success")).then(console.log)
    
       })


       app.post('/besoin_materiel',(req,res)=>{
        const {id_operation , id_materiels} = req.body;

        const fieldsToInsert = id_materiels.map((field, index) => 
            ({ id_operation: id_operation, id_mat:field })); 
        
            return postgres('besoin_mat').insert(fieldsToInsert).then(res.send("success")).then(console.log)

       })

    
    
   app.post('/realise_travail',(req,res)=>{
    const {id_operation,id_personnels} = req.body;

    const fieldsToInsert = id_personnels.map((field, index) => 
            ({ id_operation: id_operation, id_pers:field })); 
        
            return postgres('realise_trav').insert(fieldsToInsert).then(res.send("success")).then(console.log)
    
   })


   app.get('/getOperation',async (req,res)=>{
       var data1 = []
        var data2 = []
        var data3 = []
        var data4 = []
        var data0 = []
    await postgres("operation").select().then(data => data0 = data)

    await postgres.raw('select * from operation o,besoin_mat b , materiel m where b.id_operation = o.id_operation and m.id_mat = b.id_mat')
    .then(
        data =>{ 

            
            data1 =  data.rows
            console.log(data1)
        })
        await postgres.raw('select * from operation o,appliquer_op app , exploitation exp, foncier f  where o.id_operation = app.id_operation and app.id_exploitation = exp.id_exploitation and exp.id_foncier = f.id_foncier')
        .then(
        data =>{ 
   
            data2 = data.rows
            console.log(data2)
        
        })

        await postgres.raw('select * from operation o,realise_trav re, personnel per where o.id_operation = re.id_operation and re.id_pers = per.id_pers')
        .then(
            data =>{ 
    
                
                data3 =  data.rows
            
            })
        await  postgres.raw('select * from operation o, utilise_prod produ, produit prod where o.id_operation = produ.id_operation and produ.id_prod = prod.id_prod')
            .then(
                data =>{ 
        
                    
                    data4 =  data.rows
                
                })

     let newff = [];

        for (let i = 0 ; i<data0.length ; i++){
           
            for (let j = 0 ; j<data1.length ; j++){
                if(data1[j].id_operation === data0[i].id_operation){
                    console.log(data2[i])
                    if(data0[i].matName) data0[i].matName = data0[i].matName +", "+ data1[j].nom
                    else data0[i].matName = data1[j].nom.toString()
                    
                }
            }
            for (let k = 0 ; k<data2.length ; k++){
                if(data2[k].id_operation === data0[i].id_operation){
                    console.log(data2[i])
                    if(data0[i].nomFoncier) data0[i].nomFoncier = data0[i].nomFoncier +" , "+ data2[k].nom  
                    else data0[i].nomFoncier =''+ data2[k].nom  
                    if(data0[i].surface) data0[i].surface =Math.round( data0[i].surface + data2[k].surface)
                    else data0[i].surface =Math.round( data2[k].surface)
                    if(!data0[i].date_application) data0[i].date_application =  data2[k].date_application
                    

                    
                }
            }

            for (let f = 0 ; f<data4.length ; f++){
                if(data4[f].id_operation === data0[i].id_operation){
                    console.log(data2[i])
                    if(data0[i].prod) data0[i].prod = data0[i].prod + ' , ' + 'produit :'+data4[f].nom + ' quantité :'+data4[f].quantite + data4[f].unité
                    else data0[i].prod = 'produit :'+data4[f].nom + ' quantité :'+data4[f].quantite + data4[f].unité
                    
                }
            }

            for (let l = 0 ; l<data3.length ; l++){
                if(data3[l].id_operation === data0[i].id_operation){
                   
                    if(data0[i].operateur) data0[i].operateur = data0[i].operateur + ',' +  data3[l].nom.toString() 
                    else data0[i].operateur = data3[l].nom.toString()
                    
                }
            }


        }
        console.log(data0)
       
        res.send(data0)


   })



   
   app.get('/getOperation2',(req,res)=>{
    postgres.raw('select * from operation o,besoin_mat b , materiel m where b.id_operation = o.id_operation and m.id_mat = b.id_mat')
    .then(
        data =>{ 

            
            res.send(data.rows)
        
        })
   })
   
    
   
   app.get('/getOperation1',(req,res)=>{
    postgres.raw('select * from operation o,appliquer_op app , exploitation exp, foncier f  where o.id_operation = app.id_operation and app.id_exploitation = exp.id_exploitation and exp.id_foncier = f.id_foncier')
    .then(
        data =>{ 

            
            res.send(data.rows)
        
        })
   })
   app.get('/getOperation3',(req,res)=>{
    postgres.raw('select * from operation o,realise_trav re, personnel per where o.id_operation = re.id_operation and re.id_pers = per.id_pers')
    .then(
        data =>{ 

            
            res.send(data.rows)
        
        })
   })

   app.get('/getOperation4',(req,res)=>{
    postgres.raw('select * from operation o, utilise_prod produ, produit prod where o.id_operation = produ.id_operation and produ.id_prod = prod.id_prod')
    .then(
        data =>{ 

            
            res.send(data.rows)
        
        })
   })


   
       
       
    



app.listen(3001, ()=>{
    console.log('app is runing on port 3001');
})
