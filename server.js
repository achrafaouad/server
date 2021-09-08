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
              if(data[0]){
                bcrypt.compare(req.body.password, data[0].password, function(err, resp) {
                    if(resp){
                        return res.json(data[0])
                    }
                    if(err){
                        return res.json("password")
                    }
    
                });
              }
              else{
                return res.json("email")
              }
            
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
    const {nom,quantite,id_exp,date_achat,note,fournisseur,prix_unit,unit} = req.body;

    let object = {
        nom:nom,
        quantite:quantite,
        date_achat:date_achat,
        note:note,
        fournisseur:fournisseur,
        prix_unit:prix_unit,
        unit:unit,
        id_exp:id_exp
    }

    let path = 'aliment';
       console.log(path);
       postgres(path).insert(object).then(res.json("success")).then(console.log)
   })

   


   app.post('/add_exploitation',(req,res)=>{
    const {nom,date_exploitation,id_foncier,batiment,note,type,errige,culture_permanent,source_eau} = req.body;

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
        object["type"] = type; 
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
       postgres(path).returning('id_exploitation').insert(object).then(data => res.json({data:data[0]})).then(console.log)
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

   app.post('/add_NewTraitement',(req,res)=>{
    const {operation ,id_exp} = req.body;

    let object = {
        operation:operation,
        id_exp:id_exp
    }

    let path = 'traitement';
       console.log(path);
       postgres(path).insert(object).then(res.json("success")).then(console.log)
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


   app.post('/getMateriel',(req,res)=>{
    console.log("test",req.body)
    let id_ep = req.body.id_exp
    postgres('materiel').where({id_exp:id_ep}).select()
    .then(data=>{console.log(data);res.send(data)})
   })
   app.post('/get_Exploitation',(req,res)=>{
    console.log("test",req.body)
    let id_ep = req.body.id_exp
    postgres.raw('select * from exploitation exp, foncier f  where f.id_foncier = exp.id_foncier and  f.id_exp=?',[id_ep]).then(data =>{console.log(data);res.json(data.rows)})
   })
   

   app.post('/add_materiel',(req,res)=>{
    const {nom,description,fabriquant,image,model,immatriculation,id_exp} = req.body;
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
        model:model,
        immatriculation:immatriculation,
        fabriquant:fabriquant,
        derniere_controle_tec:derniere_controle_tec,
        derniere_assurence:derniere_assurence,
        n_enregistrement:n_enregistrement,
        propriétaire:propriétaire,
        id_exp:id_exp

    }
    let path = 'materiel';
    
   
   console.log(path)
       postgres(path).returning('id_mat').insert(object).then(data=> res.json({data:data[0]}))
   })


   app.post('/add_cout',(req,res)=>{
    const  {nom,type,id_exploitation,id_exp,date,durée_amortissement,année_amortissement} = req.body;
    
    
    var montant;

    let object = {
          nom: nom,
          type: type,
          id_exploitation:id_exploitation,
          id_exp:id_exp,
          date: date,
         

          durée_amortissement: durée_amortissement ,
          année_amortissement: année_amortissement

    }
    let path = 'cout_fix';
    (type=== "COÛT")?montant = -req.body.montant:montant = -req.body.montantmontant
    object['montant'] = montant
   console.log(path)
       postgres(path).insert(object).then(data=> res.json({data:data[0]}))
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
       postgres(path).returning('id').where({id:id}).update(object).then(data=> res.json({data:data[0]}))
   })
   

   app.post('/user',(req,res)=>{
    let path = 'exploiteur';
    postgres(path).where({id:req.body.id}).select().then(data=> res.send(data))
   })


   app.post('/password' , (req,res)=>{
    console.log('webi')
    
    const {confirm,current,newPass,password} = req.body;
// Load hash from your password DB.
    bcrypt.compare(password, current, function(err, resp) {
        if(resp){
            if(newPass === confirm){
                bcrypt.hash(newPass, null, null, function(err, hash) {
                    postgres('exploiteur').where({id:req.body.id}).update({password:hash}).then(res.json("success")).then(console.log)
                })
            }
            else  res.json("identique22")
        }
        else{
            res.json("passwordActuel")
        }
        
    });
    
})
    
     
    //postgres('materiel').returning('id_mat').insert({image:pathName}).then(data=> console.log({data:data[0]}))
    

    app.post('/getExploitationAnimal',(req,res)=>{
        let rr = req.body.id_exp
                postgres('exploitation_ann')
        .join('foncier', 'exploitation_ann.id_foncier', 'foncier.id_foncier')
        
        .select("exploitation_ann.id_exploitation","exploitation_ann.nom","exploitation_ann.date_exploitation","exploitation_ann.type","exploitation_ann.id_foncier","exploitation_ann.note","exploitation_ann.batiment","foncier.surface","foncier.id_exp",postgres.raw('ST_AsGeoJSON(??) AS geometry', ['foncier.geometry']))
        .where(postgres.raw('?? = ??', ['foncier.id_exp',rr]))
        .then(data=>{console.log(data);res.send(data)})
       })

       app.post('/getExploitationVeg',(req,res)=>{
        let rr = req.body.id_exp
        postgres('exploitation_veg')
        .join('foncier', 'exploitation_veg.id_foncier', 'foncier.id_foncier')
        .select("exploitation_veg.id_exploitation","exploitation_veg.nom","exploitation_veg.type_source_eau","exploitation_veg.distance_eau","exploitation_veg.vulnérable","exploitation_veg.certification","exploitation_veg.zone_spécifique","exploitation_veg.système_irrigation","exploitation_veg.nom","exploitation_veg.date_exploitation","exploitation_veg.id_foncier","exploitation_veg.note","exploitation_veg.culture_permanent","exploitation_veg.source_eau","exploitation_veg.errige","foncier.surface","foncier.id_exp",postgres.raw('ST_AsGeoJSON(??) AS geometry', ['foncier.geometry']))
        .where(postgres.raw('?? = ??', ['foncier.id_exp',rr]))
        .then(data=>{console.log(data);res.send(data)})
       })

    //    app.post('/get_foncier',(req,res)=>{
    //     postgres('exploitation')
    
    //     .select()
    //     .then(data=>{console.log(data);res.send(data)})
    //    })

       
       
       app.post('/add_animal',(req,res)=>{
        const {gender,id_maman,date_birth,race,sous_famille,note,prix,id_exploitation} = req.body;
    
        let object = {
            gender:gender,
            date_birth:date_birth,
            race:race,
            sous_famille:sous_famille,
            id_maman:id_maman,
            note:note,
            prix:prix,
            id_exploitation:id_exploitation,
            
        }
    
        let path = 'animal';
           console.log(path);
           postgres(path).insert(object).then(res.send("success")).then(console.log)
       })

       app.post('/aliment',(req,res)=>{
       let id_exp = req.body.id_exp
    
        let path = 'aliment';
        postgres("aliment").select()
        .then(data=>{console.log(data);res.send(data)})
       })


       app.post('/add_alimentation',(req,res)=>{
        const {id_aliment,quantité,date_alimentation,note,nom,id_exploitation,duré,price,currentStock} = req.body;
        let currentStockUpdated;
        let object = {
            id_aliment:id_aliment,
            quantité:(quantité * duré),
            id_exploitation:id_exploitation,
            note:note,
            duré:duré,
            date_alimentation:date_alimentation,
            price:price
        }
        if(currentStock)currentStockUpdated = Number(currentStock) - (Number(quantité) * duré)
        if(!currentStock) currentStockUpdated = - (Number(quantite) * duré)
        postgres("aliment").where({id_aliment:id_aliment}).update({quantite:currentStockUpdated}).then(console.log)
    
        let path = 'alimentation';
           console.log(path);
           postgres(path).insert(object).then(console.log)

           let object2 = {
            type:"Sortant",
            Mouvement:"alimentation",
            note:note,
            nom:nom,
            date:date_alimentation,
            quantite_produit:(quantité * duré),
            id_exp:req.body.id_exp
        }
        path = "historique_échange";
       console.log(path);
       postgres(path).insert(object2).then(res.send("success")).then(console.log)
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

       app.get('/get_aliment',(req,res)=>{
        
        let path = 'aliment';
        postgres("aliment").where({id_exp:req.body.id_exp}).select()
        .then(data=>{console.log(data);res.send(data)})
       })

       app.post('/get_maman',(req,res)=>{
         const {gender, id_exploitation} = req.body
        
        postgres("animal").where({id_exploitation:id_exploitation,gender:gender}).select()
        .then(data=>{console.log(data);res.json(data)})
       })


       app.post('/get_aliment1',(req,res)=>{
           console.log("test",req.body)
           let id_ep = req.body.id_exp
        let path = 'aliment';
        postgres('aliment').where({id_exp:id_ep}).select()
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
           postgres(path).insert(object).then(res.json("success")).then(console.log)
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

       app.post('/update_exploitationAnn',(req,res)=>{
           
        const {note,date_exploitation,batiment,type,nom,id_exploitation} = req.body;
        console.log("mohamed",type)
        let object = {
            note:note,
            date_exploitation:date_exploitation,
            nom:nom,
            batiment:batiment,
            type:type
        }
        let path = 'exploitation_veg';
           console.log(path);
           postgres('exploitation_ann').where({id_exploitation:id_exploitation}).update(object).then(res.json("pathName")).then(console.log)
       })

//todo
       app.post('/update_ProduitAnimal', async (req,res)=>{
           
        const {Lait,Oeuf,Engrais_naturel,type,id_exp,date,id_exploitation} = req.body;
        console.log("mohamed",type)
        var data_id
        var data_qt
        var qt_calc
        
        let object = {
            date:date,
            id_exploitation:id_exploitation,
            
        }


        
        if(type === 'Bovin' && Lait){
             console.log("hleb")
             await postgres('produit').where({nom:'Lait',id_exp:id_exp}).select()
            .then( data=>{ console.log("data",data); if(data[0]) {data_id = data[0].id_prod; data_qt =data[0].quantité}})
            if(data_qt){
                qt_calc = Number(data_qt) + Number(Lait);
            }
            else 
            qt_calc = Lait;
            console.log('ha produit',data_id)
            if(data_id){
                console.log("ha l id mn update",data_id) 
                await postgres('produit').where({id_prod:data_id}).update({quantité:qt_calc}).then(console.log) 
            }
            else{
                await postgres('produit').returning('id_prod').insert({nom:'Lait',unité:'l',id_exp:id_exp,quantité:Lait}).then(data=> { ; console.log("ha l id mn insert",data_id) })
            }
               object['quantité'] = Lait
               object["id_prod"]=data_id
               console.log(object)
               console.log("ham mn berra" , data_id)
               await postgres('produire').insert(object).then(data => console.log(data))

                //stock
              let object2 = {
                type:'Entrant',
                Mouvement:'Collect',
                date:date,
                quantite_produit:qt_calc,
                nom:'Lait',
                id_exp:id_exp
            }
            let path = "historique_échange";
           console.log(path);
           postgres(path).insert(object2).then(console.log)
            
        }
        if(type === 'Volaille' && Oeuf){
             await postgres('produit').where({nom:'Oeuf',id_exp:id_exp}).select()
            .then( data=>{ console.log("data",data); if(data[0]) {data_id = data[0].id_prod; data_qt =data[0].quantité}})
            if(data_qt){
                qt_calc = Number(data_qt) + Number(Oeuf);
            }
            else 
            qt_calc = Oeuf;
            console.log('ha produit',data_id)
            if(data_id){
                console.log("ha l id mn update",data_id) 
                await postgres('produit').where({id_prod:data_id}).update({quantité:qt_calc}).then(console.log) 
            }
            else{
                await postgres('produit').returning('id_prod').insert({nom:'Oeuf',unité:'Oeuf',id_exp:id_exp,quantité:Oeuf}).then(data=> { ; console.log("ha l id mn insert",data_id) })
            }
               object['quantité'] = Oeuf
               object["id_prod"]=data_id
               console.log(object)
               console.log("ham mn berra" , data_id)
               await postgres('produire').insert(object).then(data => console.log(data))


               //stock
              let object2 = {
                type:'Entrant',
                Mouvement:'Collect',
                date:date,
                quantite_produit:qt_calc,
                nom:'Oeuf',
                id_exp:id_exp
            }
            let path = "historique_échange";
           console.log(path);
           postgres(path).insert(object2).then(console.log)
            
        }

        if(Engrais_naturel){
            console.log("zebi")
            await postgres('engrais').where({nom:'Engrais_naturel',id_exp:id_exp}).select()
           .then( data=>{ console.log("data",data); if(data[0]) {data_id = data[0].id_prod; data_qt =data[0].quantité}})
           if(data_qt){
               qt_calc = Number(data_qt) + Number(Engrais_naturel);
           }
           else 
           qt_calc = Engrais_naturel;
           console.log('ha produit',data_id)
           if(data_id){
               console.log("ha l id mn update",data_id) 
               await postgres('engrais').where({id_prod:data_id}).update({quantité:qt_calc}).then(console.log) 
           }
           else{
               await postgres('engrais').returning('id_prod').insert({nom:'Engrais_naturel',unité:'kg',id_exp:id_exp,quantité:Engrais_naturel}).then(data=> {data_id = data[0].id_prod; ; console.log("ha l id mn insert",data_id) })
           }
              object['quantité'] = Engrais_naturel
              object["id_prod"]=data_id
              console.log(object)
              console.log("ham mn berra" , data_id)
              await postgres('produire').insert(object).then(data => console.log(data))


              //stock
              let object2 = {
                type:'Entrant',
                Mouvement:'Collect',
                date:date,
                quantite_produit:qt_calc,
                nom:'Engrais naturel',
                id_exp:id_exp
            }
            console.log("historique_échange")
            let path = "historique_échange";
           console.log(path);
           postgres(path).insert(object2).then(console.log)
            

       }

       
    

        
       
        res.json(data_id)

        
 
        
       })


       app.post('/update_Animal',(req,res)=>{
           
        const {id_ann,gender,date_birth,race,sous_famille,note,prix} = req.body;
        let object = {
            gender:gender,
            date_birth:date_birth,
            race:race,
            sous_famille:sous_famille,
            note:note,
            prix:prix
    
        }
        let path = 'exploitation_veg';
           console.log(path);
           postgres('animal').where({id_ann:id_ann}).update(object).then(res.json("pathName")).then(console.log)
       })


       app.post('/updateRecolte',(req,res)=>{
        const {quantité,id_prod} = req.body;

        let object = {
            id_prod:id_prod,
            quantité:quantité
    
        }
           postgres('rr').where({id_prod:id_prod}).update(object).then(res.json("pathName")).then(console.log)
       })

       app.post('/getPersonnel1',(req,res)=>{
        console.log("test",req.body)
        let id_ep = req.body.id_exp
     
     postgres('personnel').where({id_exp:id_ep}).select()
     .then(data=>{console.log(data);res.send(data)})

       
    
       })
        
       app.post('/getEngrais',(req,res)=>{
        console.log("test",req.body)
        let id_ep = req.body.id_exp
     
     postgres('engrais').where({id_exp:id_ep}).select()
     .then(data=>{console.log(data);res.send(data)})
       })


       app.post('/getProduit12',(req,res)=>{
        console.log("test",req.body)
        let id_ep = req.body.id_exp
        var Lait = "Lait"
         var Oeuf = "Oeuf"
        postgres.raw('select * from produit where produit.nom = \'Oeuf\' or produit.nom = \'Lait\' and id_exp = ?',[id_ep])
        .then(
            data =>{ 
           res.json(data.rows)
            })
       })



       app.get('/getProduit',(req,res)=>{
        postgres('produit')
        .select().then(data=>{console.log(data);res.send(data)})
    
       })
       app.post('/getRecolte',(req,res)=>{
        console.log("test",req.body)
        let id_ep = req.body.id_exp
     
     postgres('rr').where({id_exp:id_ep}).select()
     .then(data=>{console.log(data);res.send(data)})
    

    
       })
       app.post('/historique',(req,res)=>{
        console.log("test",req.body)
        let id_ep = req.body.id_exp
     
     postgres('historique_échange').where({id_exp:id_ep}).select()
     .then(data=>{console.log(data);res.send(data)})

      
       })

       app.post('/getmat144',(req,res)=>{
        console.log("test",req.body)
        let id_ep = req.body.id_exp
     
     postgres('materiel').where({id_exp:id_ep}).select()
     .then(data=>{console.log(data);res.send(data)})
     
    
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

       app.post('/getPhyto',(req,res)=>{
        console.log("test",req.body)
        let id_ep = req.body.id_exp
     
     postgres('phytosantaire').where({id_exp:id_ep}).select()
     .then(data=>{console.log(data);res.send(data)})

    
       })
       app.post('/getCout',(req,res)=>{
        console.log("test",req.body)
        let id_ep = req.body.id_exp
     
        postgres.raw('select *,exp.nom as name ,cout.nom as nomCout  from cout_fix cout, exploitation exp where exp.id_exploitation = cout.id_exploitation and cout.id_exp=?',[id_ep]).then(data=>{console.log(data);res.json(data.rows)})

    
       })


       app.post('/getSemence',(req,res)=>{
        console.log("test",req.body)
        let id_ep = req.body.id_exp
     
     postgres('semence_plants').where({id_exp:id_ep}).select()
     .then(data=>{console.log(data);res.send(data)})

        
    
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

       app.post('/updateProduit144',(req,res)=>{
        const {prix_uni,VALIDE_DEPUIS,id_prod} = req.body;
        let object = {
            prix_uni:prix_uni,
            VALIDE_DEPUIS:VALIDE_DEPUIS,
            

        }
         let path = "produit";
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


       app.post('/add_produit', async (req,res)=>{
        const {nom,unité,id_exp ,prix_uni,myProp, n_enregistrement,composition,fabriquant, culture, azote,phosphore,potassium,composition_n_oligo_elements} = req.body;
    
        let object = {
            nom:nom,
            unité:unité,
            prix_uni:prix_uni,
            id_exp:id_exp
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
              postgres('rr').insert(object).then(console.log)
            };
       
       console.log(path)

           postgres(path).insert(object).then(res.json(path)).then(console.log)
           

       })

      
       





       //todo

       app.post('/add_operation',(req,res)=>{
        const {duré,note,prix_totale,travaux,id_exp} = req.body;
        let object ={
            duré:duré,
            note:note,
            prix_totale:prix_totale,
            travaux:travaux,
            id_exp:id_exp
        }
        postgres('operation').returning('id_operation').insert(object).then(data=> {res.json({data:data[0]}); console.log(data)}).catch(err => console.log(err))
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
        
            return postgres('utilise_prod').insert(fieldsToInsert).then(res.json("success")).then(console.log)
    
       })


       


       app.post('/besoin_materiel',(req,res)=>{
        const {id_operation , id_materiels} = req.body;

        const fieldsToInsert = id_materiels.map((field, index) => 
            ({ id_operation: id_operation, id_mat:field })); 
        
            return postgres('besoin_mat').insert(fieldsToInsert).then(res.json("success")).then(console.log)

       })

    
    
   app.post('/realise_travail',(req,res)=>{
    const {id_operation,id_personnels} = req.body;

    const fieldsToInsert = id_personnels.map((field, index) => 
            ({ id_operation: id_operation, id_pers:field })); 
        
            return postgres('realise_trav').insert(fieldsToInsert).then(res.json("success")).then(console.log)
    
   })


   app.post('/getOperation',async (req,res)=>{
       var data1 = []
        var data2 = []
        var data3 = []
        var data4 = []
        var data0 = []
    await postgres("operation").where({id_exp:req.body.id_exp}).select().then(data => data0 = data)

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



   app.post('/RaportResult',async (req,res)=>{
       const {id_exp} = req.body
       var data1 = []
        var data2 = []
        var data3 = []
        var data4 = []
        var data4sem = []
        var data4phyto = []
        var data4Eng = []
        var data0 = []
        var data00 = []
    await postgres("operation").where({id_exp:req.body.id_exp}).select().then(data => {data0 = data; data00 = data})

    await postgres.raw('select * from operation o,besoin_mat b , materiel m where b.id_operation = o.id_operation and m.id_mat = b.id_mat And o.id_exp=?',[id_exp])
    .then(
        data =>{ 

            
            data1 =  data.rows
            console.log(data1)
        })
        await postgres.raw('select * from operation o,appliquer_op app , exploitation exp, foncier f  where o.id_operation = app.id_operation and app.id_exploitation = exp.id_exploitation and exp.id_foncier = f.id_foncier And o.id_exp=?',[id_exp])
        .then(
        data =>{ 
   
            data2 = data.rows
            console.log(data2)
        
        })

        await postgres.raw('select * from operation o,realise_trav re, personnel per where o.id_operation = re.id_operation and re.id_pers = per.id_pers And o.id_exp=?',[id_exp])
        .then(
            data =>{ 
    
                
                data3 =  data.rows
            
            })


        await  postgres.raw('select * from operation o, utilise_prod produ, semence_plants prod where o.id_operation = produ.id_operation and produ.id_prod = prod.id_prod And o.id_exp=?',[id_exp])
            .then(
                data =>{ 
        
                    
                    data4sem =  data.rows
                
                })
        await  postgres.raw('select * from operation o, utilise_prod produ, phytosantaire prod where o.id_operation = produ.id_operation and produ.id_prod = prod.id_prod And o.id_exp=?',[id_exp])
            .then(
                data =>{ 
        
                    
                    data4phyto =  data.rows
                
                })
        await  postgres.raw('select * from operation o, utilise_prod produ, engrais prod where o.id_operation = produ.id_operation and produ.id_prod = prod.id_prod And o.id_exp=?',[id_exp])
            .then(
                data =>{ 
        
                    
                    data4Eng =  data.rows
                
                })

     let newff = [];

        for (let i = 0 ; i<data0.length ; i++){
           
            for (let j = 0 ; j<data1.length ; j++){
                if(data1[j].id_operation === data0[i].id_operation){
                    console.log(data2[i])
                    if(data0[i].matPrice) data0[i].matPrice = Number(data0[i].matPrice) + Number(data1[j].prix_hr)*(Number(data0[i].duré.split(':')[0]) +Number(data0[i].duré.split(':')[1])/60 )
                    else data0[i].matPrice = Number(data1[j].prix_hr)*(Number(data0[i].duré.split(':')[0]) +Number(data0[i].duré.split(':')[1])/60 )
                }
            }
            for (let k = 0 ; k<data2.length ; k++){
                if(data2[k].id_operation === data0[i].id_operation){
                    console.log(data2[i])
                    if(data0[i].nomFoncier) data0[i].nomFoncier = data0[i].nomFoncier +" , "+ data2[k].nom  
                    else data0[i].nomFoncier =''+ data2[k].nom 
                    

                    if(data0[i].surface) data0[i].surface =Math.round( data0[i].surface + data2[k].surface)
                    else data0[i].surface =Math.round( data2[k].surface)
                    

                    
                }
            }

            for (let f = 0 ; f<data4sem.length ; f++){
                if(data4sem[f].id_operation === data0[i].id_operation){
                    console.log(data2[i])
                    if(data4sem[f].prix_uni && data4sem[f].quantite){
                    if(data0[i].Sem) data0[i].Sem = Number(data0[i].Sem) + Number(data4sem[f].prix_uni * data4sem[f].quantite)
                    else data0[i].Sem =  Number(data4sem[f].prix_uni * data4sem[f].quantite)

                    }
                }
            }
            for (let f = 0 ; f<data4Eng.length ; f++){
                if(data4Eng[f].id_operation === data0[i].id_operation){
                    console.log(data2[i])
                    if(data4Eng[f].prix_uni && data4Eng[f].quantite){
                    if(data0[i].Eng) data0[i].Eng = Number(data0[i].Eng) + Number(data4Eng[f].prix_uni * data4Eng[f].quantite)
                    else data0[i].Eng =  Number(data4Eng[f].prix_uni * data4Eng[f].quantite)

                    }
                }
            }
            for (let f = 0 ; f<data4phyto.length ; f++){
                if(data4phyto[f].id_operation === data0[i].id_operation){
                    console.log(data2[i])
                    if(data4phyto[f].prix_uni && data4phyto[f].quantite){
                    if(data0[i].Phy) data0[i].Phy = Number(data0[i].Phy) + Number(data4phyto[f].prix_uni * data4phyto[f].quantite)
                    else data0[i].Phy = Number(data4phyto[f].prix_uni * data4phyto[f].quantite)

                    }
                }
            }

            for (let l = 0 ; l<data3.length ; l++){
                if(data3[l].id_operation === data0[i].id_operation){
                   if(data3[l].salaire_hr)
                   { if(data0[i].operateur) data0[i].operateur = Number(data0[i].operateur) + Number(data3[l].salaire_hr )*(Number(data0[i].duré.split(':')[0]) +Number(data0[i].duré.split(':')[1])/60 )
                    else data0[i].operateur = Number(data3[l].salaire_hr )*(Number(data0[i].duré.split(':')[0]) +Number(data0[i].duré.split(':')[1])/60 )
                    }
                }
            }
    }

    for(let i=0; i<data0.length ; i++){
        if(!data0[i].nomFoncier){
            data0.splice((i), 1)
            i--
        }
    }

    var myNewObject = {}
    
        await postgres('foncier').where({id_exp:req.body.id_exp}).select()
       .then(
           data =>{ 
   
               for(let i = 0 ; i <data.length;i++ ){
                   myNewObject[data[i].nom] = data[i].surface
               }
           
           })


    

    




    for(let i=0; i<data0.length ; i++){
        console.log('l9lawe',data0.length)
        if(data0[i].nomFoncier.split(' , ').length >1){
            

            for( let f=1;f< data0[i].nomFoncier.split(',').length ; f++){
                
                console.log("ffff",f)
                var object = {
                    id_operation:(-1 -f -data0[i].id_operation),
                    nomFoncier:data0[i].nomFoncier.split(' , ')[f],
                    Eng:data0[i].Eng *( Number(myNewObject[data0[i].nomFoncier.split(' , ')[f]])/Number(data0[i].surface)),
                    Phy: Number(data0[i].Phy) *( Number(myNewObject[data0[i].nomFoncier.split(' , ')[f]])/Number(data0[i].surface)),
                    operateur:data0[i].operateur *( Number(myNewObject[data0[i].nomFoncier.split(' , ')[f]])/Number(data0[i].surface)),
                    matPrice:data0[i].matPrice *( Number(myNewObject[data0[i].nomFoncier.split(' , ')[f]])/Number(data0[i].surface)),
                }
                data0.push(object)
         
                
            }

            data0[i].nomFoncier =data0[i].nomFoncier.split(' , ')[0]
            data0[i].Eng = data0[i].Eng *( Number(myNewObject[data0[i].nomFoncier.split(' , ')[0]])/Number(data0[i].surface))
            data0[i].Phy = Number(data0[i].Phy) *( Number(myNewObject[data0[i].nomFoncier.split(' , ')[0]])/Number(data0[i].surface))
            data0[i].operateur =data0[i].operateur *( Number(myNewObject[data0[i].nomFoncier.split(' , ')[0]])/Number(data0[i].surface))
            data0[i].matPrice = data0[i].matPrice *( Number(myNewObject[data0[i].nomFoncier.split(' , ')[0]])/Number(data0[i].surface))
            
           }
           
        
        }




    

    

    

        var i =0
for(let i = 0;i<data0.length-1;i++){
    for(let j = i+1;j<data0.length;j++){

        if(data0[i].nomFoncier === data0[j].nomFoncier){

            if(data0[i].matPrice && data0[j].matPrice){
                data0[i].matPrice = Number(data0[i].matPrice) + Number(data0[j].matPrice)
            }

            if(!data0[i].matPrice && data0[j].matPrice){
                data0[i].matPrice =  Number(data0[j].matPrice)
            }

            if(data0[i].Eng && data0[j].Eng){
                data0[i].Eng = Number(data0[i].Eng) + Number(data0[j].Eng)
            }

            if(!data0[i].Eng && data0[j].Eng){
                data0[i].Eng =  Number(data0[j].Eng)
            }

            if(data0[i].operateur && data0[j].operateur){
                data0[i].operateur = Number(data0[i].operateur) + Number(data0[j].operateur)
            }

            if(!data0[i].operateur && data0[j].operateur){
                data0[i].operateur =  Number(data0[j].operateur)
            }
            if(data0[i].Sem && data0[j].Sem){
                data0[i].Sem = Number(data0[i].Sem) + Number(data0[j].Sem)
            }

            if(!data0[i].Sem && data0[i+1].Sem){   
                data0[i].Sem =  Number(data0[j].Sem)
            }
            
            if(data0[i].Phy && data0[i+1].Phy){
                data0[i].Phy = Number(data0[i].Phy) + Number(data0[j].Phy)
            }

            if(!data0[i].Phy && data0[i+1].Phy){   
                data0[i].Phy =  Number(data0[j].Phy)
            }
            
            
            data0.splice((j), 1)
            j--

        }
    }
}


var data1 =[]
var data2 =[]
var Ndata2 =[]


await postgres.raw('select * from operation o, utilise_prod produ, rr prod where o.id_operation = produ.id_operation and produ.id_prod = prod.id_prod AND o.travaux LIKE \'%Moissonner%\' And o.id_exp=?',[id_exp])
.then(
 data =>{ 

     
     data1 = data.rows;
     
 
 })


 await postgres.raw('select * from operation o,appliquer_op app , exploitation exp, foncier f where o.id_operation = app.id_operation and app.id_exploitation = exp.id_exploitation and exp.id_foncier = f.id_foncier ')
 .then(
 data =>{ 

    data2 = data.rows;
 })




 for(let i = 0; i<data2.length-1;i++){
     
     if(data2[i].id_operation === data2[i+1].id_operation){
         
         var s = 0
         var indice = i;
         for(let j = indice; j<data2.length;j++){
             
             if(data2[j].id_operation === data2[indice].id_operation ){
                 console.log("webi",i)
                 s+=data2[j].surface;
             }
         }
         for(let j = indice; j<data2.length;j++){
             
             if(data2[j].id_operation === data2[indice].id_operation ){
                 console.log("webi",i)
                 data2[j].surfaceTot = s
             }
         }
          
     } 
 }


 for(let i = 0;i<data2.length;i++){
     for(let j=0;j<data1.length;j++){
         if(data1[j].id_operation === data1[j].id_operation){
             data2[i].quantite = data1[j].quantite
             data2[i].prix_uni = data1[j].prix_uni
             data2[i].nomProd = data1[j].nom
         }
     }
     if(data2[i].travaux){
     if(!data2[i].travaux.includes('Moissonner')){
         data2.splice((i), 1)
         i--
     }}
     else{
         data2.splice((i), 1)
         i--
     }
 }

 for(let i = 0;i<data2.length;i++){
     if(data2[i].surfaceTot){
         data2[i].recolt = (data2[i].prix_uni * data2[i].quantite)*(data2[i].surface/data2[i].surfaceTot)
     }
     else data2[i].recolt =(data2[i].prix_uni * data2[i].quantite)
 }


 for(let i = 0;i<data0.length;i++){
     for(j=0;j<data2.length;j++){
         if(data0[i].nomFoncier ===data2[j].nom){
             if(data0[i].recolt) data0[i].recolt =  Number(data0[i].recolt) + Number(data2[j].recolt)
             else data0[i].recolt = Number(data2[j].recolt)
         }
     }
 }

 var CoutFixdata=[]

 await postgres.raw('select *,exp.nom as name ,cout.nom as nomCout  from cout_fix cout, exploitation exp where exp.id_exploitation = cout.id_exploitation and cout.id_exp=?',[id_exp]).then(data=>{console.log(data); CoutFixdata = data.rows})
 for(let j = 0;j<data0.length;j++){
 for(i=0 ;i<CoutFixdata.length;i++){
     if(CoutFixdata[i].nom === data0[j].nomFoncier){
        if(data0[j].priceTot) data0[j].priceTot= Number(data0[j].priceTot) + Number(CoutFixdata[i].montant)
        else data0[j].priceTot = Number(CoutFixdata[i].montant)
     }
 }
}



 

 for(let i = 0;i<data0.length;i++){
    
    data0[i].Entrant = 0
    data0[i].priceTot = 0
    


    if(data0[i].matPrice){ data0[i].matPrice = - data0[i].matPrice ; data0[i].priceTot  += data0[i].matPrice}
    if(data0[i].Eng) {data0[i].Eng = - data0[i].Eng; data0[i].priceTot += data0[i].Eng ; data0[i].Entrant += data0[i].Eng}
    if(data0[i].operateur) {data0[i].operateur = - data0[i].operateur;data0[i].priceTot += data0[i].operateur}
    if(data0[i].Phy) {data0[i].Phy = - data0[i].Phy ; data0[i].priceTot += data0[i].Phy; data0[i].Entrant += data0[i].Phy }
    if(data0[i].Sem){ data0[i].Sem = - data0[i].Sem ; data0[i].priceTot +=data0[i].Sem; data0[i].Entrant +=data0[i].Sem}
     if(data0[i].priceTot && data0[i].recolt)data0[i].Roi = ((data0[i].recolt-data0[i].priceTot )/data0[i].priceTot)*100
     else data0[i].Roi= 0
     if(data0[i].recolt) data0[i].margeNet = Number(data0[i].recolt) + data0[i].priceTot
     else data0[i].margeNet =  data0[i].priceTot
 }


 










        console.log(data0)
        res.json(data0)
        


   })




   app.post('/getCalender',async (req,res)=>{
       const {id_exp} = req.body
    var data1 = []
    var data2 = []
    var data3 = []
    var data4 = []
    var data0 = []
    await postgres("operation").select().where(postgres.raw( 'travaux LIKE \'%Semer%\' and id_exp = ?',[id_exp])).then(data => data0 = data)

    await postgres.raw('select * from operation o,appliquer_op app , exploitation exp, foncier f  where o.id_operation = app.id_operation and app.id_exploitation = exp.id_exploitation and exp.id_foncier = f.id_foncier')
    .then(
    data =>{ 

        data2 = data.rows
        console.log(data2)
    
    })

    await  postgres.raw('select * from operation o, utilise_prod produ, semence_plants prod where o.id_operation = produ.id_operation and produ.id_prod = prod.id_prod')
            .then(
                data =>{ 
        
                    
                    data4 =  data.rows
                
                })

                
                for (let i = 0 ; i<data0.length ; i++){
                for (let k = 0 ; k<data2.length ; k++){
                    if(data2[k].id_operation === data0[i].id_operation){
                        console.log(data2[i])
                        if(data0[i].content) data0[i].content = data0[i].content +" , "+ data2[k].nom  
                        else data0[i].content =''+ data2[k].nom  
                        if(!data0[i].date_application) data0[i].date_application =  data2[k].date_application
                        
                    }
                }
                for (let f = 0 ; f<data4.length ; f++){
                    if(data4[f].id_operation === data0[i].id_operation){
                        console.log(data2[i])
                        if(data0[i].items) data0[i].items = [...data0[i].items,...[data4[f].culture]] 
                        else data0[i].items = [data4[f].culture]
                        
                    }
                }

            }
            var i=0


            for(let i=0; i<data0.length ; i++){
                if(!data0[i].items || !data0[i].date_application){
                    data0.splice((i), 1)
                    i--
                }
            }

            
            while( i<data0.length-1){
               
                
                if(data0[i].content === data0[i+1].content){
                    
                    if(data0[i+1].items && data0[i+1].date_application && data0[i].items && data0[i].date_application )
                    {
                    
                    if(data0[i].items.length){
                        data0[i].items = [...data0[i].items ,...data0[i+1].items   ]  
                    }


                    else data0[i].items = [...[data0[i].items] ,...[data0[i+1].items] ] 
                    
                    if(data0[i].date_application.length){
                        data0[i].date_application = [...data0[i].date_application ,...[data0[i+1].date_application]   ]  
                    }
                    else data0[i].date_application = [...[data0[i].date_application] ,...[data0[i+1].date_application] ] 
                    
                    data0.splice((i+1), 1)
                    i=-1
                
                }


                }
               
                
                else {
                   
                    let data13 = data0[i];
                      data0[i] = data0[i+1]; 
                      data0[i+1] = data13 
                      
                }
                       
                       i++    
                    
                    }
                
                    var j = 0
                       while( j<data0.length-1){
                        if(!data0[j].items || !data0[j].date_application){
                            data0.splice((j), 1)
            
                        }
                        j++
                       }

                    var l = 0
                       do{
                        
                            data0[l].id = l+1
                        
                        
                        l++
                       }while( l<data0.length)

            res.send(data0)
    


   })



   var myNewObject = {}
   app.post('/getOperation2',(req,res)=>{
     postgres('foncier').where({id_exp:req.body.id_exp}).select()
    .then(
        data =>{ 

            for(let i = 0 ; i <data.length;i++ ){
                myNewObject[data[i].nom] = data[i].surface
            }
        
        })
   })
   
    
   
   app.get('/getOperation1',(req,res)=>{
    postgres.raw('select * from operation o, utilise_prod produ, semence_plants prod where o.id_operation = produ.id_operation and produ.id_prod = prod.id_prod')
    .then(
        data =>{ 

            
            res.send(data.rows)
        
        })
   })

   app.post('/getOperation3',(req,res)=>{
     postgres("operation").select().where(postgres.raw( 'travaux LIKE \'%Semer%\' and id_exp = ?',[req.body.id_exp])).then(data => data0 = data)
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
   app.post('/handleMouvement',(req,res)=>{
    let {type,id_prod,date,n_facture,Mouvement,quantite,numéro_de_lot,client,note,currentStock,nom,id_aliment,Exploitation} = req.body;
    let object = {
        type:type,
        Mouvement:Mouvement,
        n_facture:n_facture,
        numéro_de_lot:numéro_de_lot,
        client:client,
        note:note,
        nom:nom,
        date:date,
        quantite_produit:quantite,
        id_exp:req.body.id_exp
    }
    if(type === 'Entrant' && Mouvement !== "Opération" && Exploitation==='Végétal'){
       
        if(currentStock)currentStock = Number(currentStock) + Number(quantite)
        if(!currentStock) currentStock = Number(quantite)
        postgres("produit").where({id_prod:id_prod}).update({quantité:currentStock}).then(console.log)
    }

    if(type === 'Entrant' && Mouvement !== "Opération" && Exploitation==='Animal'){
       
        if(currentStock)currentStock = Number(currentStock) + Number(quantite)
        if(!currentStock) currentStock = Number(quantite)

        postgres("aliment").where({id_aliment:id_aliment}).update({quantite:currentStock, date_achat:date}).then(console.log)
    }
    if(type === 'Sortant' && Mouvement !== "Opération" && Exploitation==='Végétal'){
        currentStock = Number(currentStock) - Number(quantite)
        postgres("rr").where({id_prod:id_prod}).update({quantité:currentStock}).then(console.log)
    }
    if(type === 'Sortant' && Mouvement !== "Opération" && Exploitation==='Animal'){
        currentStock = Number(currentStock) - Number(quantite)
        postgres("produit").where({id_prod:id_prod}).update({quantité:currentStock}).then(console.log)
    }

     let path = "historique_échange";
       console.log(path);
       postgres(path).insert(object).then(res.json("success")).then(console.log)
   })


   app.post('/updateProduit',(req,res)=>{
    const {id_produit , QuantityUpdate,currentQuantity} = req.body;
    console.log("liuuu",id_produit)
    console.log("liuuu",QuantityUpdate)
    console.log("liuuu",currentQuantity)
      id_produit.forEach((field, index) => {
          var misajour;
        if(currentQuantity[index]){
            console.log()
             misajour = currentQuantity[index] - QuantityUpdate[index] 
    }
        else{
             misajour = - QuantityUpdate[index] 
        }
        
        postgres("produit").where({id_prod:field}).update({quantité:misajour}).then(console.log)
    })
    res.send("success update")
   })
   
   app.post('/handleMouvementProduit',(req,res)=>{
    let {noms,qunatite,type,Mouvement,date,note} = req.body;
    console.log("noms",noms)
    noms.forEach((field, index) => {
        let quant = qunatite[index] 
        let object={
            quantite_produit:quant,
            date:date,
            nom:field,
            note:note,
            type:type,
            Mouvement:Mouvement,
            id_exp:req.body.id_exp
        }
        let path = "historique_échange";
       console.log(path);
       postgres(path).insert(object).then(res.send("success")).then(console.log)
      
  })


     
   })

   app.post('/calculePrix',async (req,res)=>{
    let {id_exploitation , id_ann} = req.body;

    var coutTrait;
    var prix_achat;
    var sumAliment;
    var countAnimal;
    var prix ;

        let path = "effectuer_traitement";
       console.log(path);

       await postgres('effectuer_traitement').where({id_ann:id_ann}).sum('cout').then(data =>{
        console.log("coutTrait",data[0].sum)
        coutTrait = data[0].sum
        })

       await postgres('animal').where({id_ann:id_ann}).select('prix').then(data =>{
        console.log("prix_achat",data[0].prix)
        prix_achat = data[0].prix
        })

        await postgres('alimentation').where({id_exploitation:id_exploitation}).sum('price').then(data =>{
            console.log("sumAliment",data[0].sum)
            sumAliment = data[0].sum
            })

        await postgres('animal').where({id_exploitation:id_exploitation}).count().then(data =>{
            console.log("countAnimal",data[0].count)
            countAnimal = data[0].count
            })

            

            if(countAnimal != 0){prix = coutTrait + prix_achat + (sumAliment/countAnimal);}
            else prix = coutTrait + prix_achat;
       res.json(prix)

   })

app.listen(3001, ()=>{
    console.log('app is runing on port 3001');
})
