const express = require('express');
const bodyParser = require('body-Parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const multer = require('multer');
var path = require('path');
const { format } = require('date-fns');

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
function SousDays(days) {
    var result = new Date();
    result.setDate(result.getDate() - days);
    return  format(result, 'dd/MM/yyyy');
  }

function AddDays( date) {
    var result = new Date(date)
    result.setDate(result.getDate() + 365);
    console.log("date",format(result, 'dd/MM/yyyy'))
    // return  format(result, 'dd/MM/yyyy');
    return result
  }

  function ecart_mois(date_max, date_min)
  {   
      var explode_date_min;
      var explode_date_max;
      var mois_min;
      var annee_min;
      var mois_max;
      var annee_max;
      var ecart;
      
      explode_date_min = date_min.split('/');
      explode_date_max = date_max.split('/');
      
      mois_min = parseInt(explode_date_min[1]);
      annee_min = parseInt(explode_date_min[2]);
      
      mois_max = parseInt(explode_date_max[1]);
      annee_max = parseInt(explode_date_max[2]);
      
       ecart = ((annee_max - annee_min)*12) - (mois_min) + (mois_max);
       console.log ('ecart' ,ecart);
       return ecart
      
  }


app.get('/',(req, res)=>{
    res.json(database)
})

app.post('/signin',async(req, resp)=>{
    var data0
   await postgres('exploiteur').where({email:req.body.email}).select().then(data =>{console.log(data[0]) ; data0 = data[0]});
  
if(data0){
    
   bcrypt.compare(req.body.password, data0.password, function(err, res) {
       console.log(res)
    if(res){
        console.log(data0)
        resp.json(data0)
    }
    else{
        resp.json("password")
    }
});}
else{
    resp.json("email")
}
})

// app.post('/',(req, res)=>{
//     console.log(req.body.email , req.body.password)
//     postgres('exploiteur').where(function() {
//         this.where('email', req.body.email)
//       }).then(
//           data => {
//               if(data[0]){
//                 bcrypt.compare(req.body.password, data[0].password, function(err, resp) {
//                     if(resp){
//                         console.log(res.json(data[0]))
//                         res.json(data[0])
//                     }
//                     if(err){
//                         return res.send("password")
//                     }
    
//                 });
//               }
//               else{
//                 return res.send("email")
//               }
            
//             })

    
//     })

    // app.post('/get_foncier',(req, res)=>{
    //     //postgres('foncier').select(postgres.raw('ST_AsGeoJSON(??) AS geometry', ['foncier.geometry'])).where('id_foncier',41).then(data => res.send(data));
    //     // postgres('foncier').where({
    //     //     id_foncier:39,
    //     //   }).select('geometry').then((data)=>{res.send(data)})
    //     postgres('foncier').select('id_foncier','id_exp','nom','surface',postgres.raw('ST_AsGeoJSON(??) AS geometry', ['foncier.geometry'])).where('id_exp',req.body.id).then(data => res.send(data));
    //            })

    app.post('/get_foncier',async (req, res)=>{
        //postgres('foncier').select(postgres.raw('ST_AsGeoJSON(??) AS geometry', ['foncier.geometry'])).where('id_foncier',41).then(data => res.send(data));
        // postgres('foncier').where({
        //     id_foncier:39,
        //   }).select('geometry').then((data)=>{res.send(data)})
        var data25 = []
        await postgres.raw('select *,ST_AsGeoJSON(f.geometry) AS geometryJSON from foncier f, exploitation_ann an where f.id_foncier = an.id_foncier and id_exp = ?',[req.body.id])
        .then(data => { data25 = data.rows})

        await postgres.raw('select *,ST_AsGeoJSON(f.geometry) AS geometryjson from foncier f, exploitation_veg veg where f.id_foncier = veg.id_foncier and id_exp = ?',[req.body.id])
        .then(data => { for(let i=0;i<data.rows.length;i++){
            data25.push(data.rows[i])
        }})

        res.send(data25) 


    })

    


app.post('/register', async (req, res)=>{
    const {email,password,name,country} = req.body;
    var testMail = false 
    await postgres('exploiteur').where({email:email}).select('email').then(
        data => {if (data.length!=0) {testMail =true}})
   if(testMail === false){
    bcrypt.hash(password, null, null, function(err, hash) {
        
    postgres('exploiteur').insert({
             nom:name,
            email:email,
            password:hash,  
    }).then(console.log)
    });
    res.json("success")
}
else{
    res.json("error")
}


    
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
const {nom,surface,geometry,id_exp,prix_achat,date_achat,prix_loue,proprietaire,date_loue,type_foncier} = req.body;
let object = {
    nom:nom,
    surface:surface,
    geometry:geometry,
    id_exp:id_exp,
} 
console.log(geometry)

let path = 'foncier';
console.log(prix_achat)
if(type_foncier ==="poss??d??e"){
     object["date_achat"] = date_achat;
     object["prix_achat"] = prix_achat;
      path = 'foncier_dispos??'
      console.log(path)
 
    };

if(type_foncier ==="lou??"){
     object["prix_loue"] = prix_loue;
     object["proprietaire"] = proprietaire;
     object["date_loue"] = date_loue;
      path = 'foncier_lou??'
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
    const {nom,date_exploitation,id_foncier,batiment,note,type,errige,culture_permanent,production,source_eau} = req.body;

    let object = {
        nom:nom,
        date_exploitation:date_exploitation,
        id_foncier:id_foncier
    }
    console.log(batiment);
    console.log(errige);
    let path = 'exploitation';
    if(production ==="animal"){
        object["batiment"] = batiment;
        object["note"] = note; 
        object["type"] = type; 
        path = 'exploitation_ann';
        console.log(path)
        };
    if(production === "v??g??tale"){
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
    propri??taire = req.body.propri??taire;
    
    

    let object = {
        nom:nom,
        description:description,
        model:model,
        immatriculation:immatriculation,
        fabriquant:fabriquant,
        derniere_controle_tec:derniere_controle_tec,
        derniere_assurence:derniere_assurence,
        n_enregistrement:n_enregistrement,
        propri??taire:propri??taire,
        id_exp:id_exp

    }
    let path = 'materiel';
    
   
   console.log(path)
       postgres(path).returning('id_mat').insert(object).then(data=> res.json({data:data[0]}))
   })


   app.post('/add_cout',(req,res)=>{
    const  {nom,type,id_exploitation,id_exp,date,dur??e_amortissement,ann??e_amortissement} = req.body;
    
    
    var montant;

    let object = {
          nom: nom,
          type: type,
          id_exploitation:id_exploitation,
          id_exp:id_exp,
          date: date,
         

          dur??e_amortissement: dur??e_amortissement ,
          ann??e_amortissement: ann??e_amortissement

    }
    let path = 'cout_fix';
    (type=== "CO??T")?montant = -req.body.montant:montant = -req.body.montantmontant
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
        .select("exploitation_veg.id_exploitation","exploitation_veg.nom","exploitation_veg.type_source_eau","exploitation_veg.distance_eau","exploitation_veg.vuln??rable","exploitation_veg.certification","exploitation_veg.zone_sp??cifique","exploitation_veg.syst??me_irrigation","exploitation_veg.nom","exploitation_veg.date_exploitation","exploitation_veg.id_foncier","exploitation_veg.note","exploitation_veg.culture_permanent","exploitation_veg.source_eau","exploitation_veg.errige","foncier.surface","foncier.id_exp",postgres.raw('ST_AsGeoJSON(??) AS geometry', ['foncier.geometry']))
        .where(postgres.raw('?? = ??', ['foncier.id_exp',rr]))
        .then(data=>{console.log(data);res.send(data)})
       })

    //    app.post('/get_foncier',(req,res)=>{
    //     postgres('exploitation')
    
    //     .select()
    //     .then(data=>{console.log(data);res.send(data)})
    //    })

       
       
       app.post('/add_animal',(req,res)=>{
        const {gender,date_achat,id_maman,date_birth,race,sous_famille,note,prix,id_exploitation} = req.body;
    
        let object = {
            gender:gender,
            date_birth:date_birth,
            date_achat:date_achat,
            race:race,
            sous_famille:sous_famille,
            id_maman:id_maman,
            note:note,
            prix:prix,
            cout_revien:prix,
            id_exploitation:id_exploitation,
            
        }
    
        let path = 'animal';
           console.log(path);
           postgres(path).insert(object).then(res.json("success")).then(console.log)
       })

       app.post('/aliment',(req,res)=>{
       let id_exp = req.body.id_exp
    
        let path = 'aliment';
        postgres("aliment").select()
        .then(data=>{console.log(data);res.send(data)})
       })


       app.post('/add_alimentation',async (req,res)=>{
        const {id_aliment,quantit??,date_alimentation,note,nom,id_exploitation,dur??,price,currentStock} = req.body;
        var currentStockUpdated;
        var prixUnit;
        var countAnimal;

        let object = {
            id_aliment:id_aliment,
            quantit??:(quantit?? * dur??),
            id_exploitation:id_exploitation,
            note:note,
            dur??:dur??,
            date_alimentation:date_alimentation,
            price:price
        }
        if(currentStock)currentStockUpdated = Number(currentStock) - (Number(quantit??) * dur??)
        if(!currentStock) currentStockUpdated = - (Number(quantite) * dur??)
        await postgres("aliment").where({id_aliment:id_aliment}).update({quantite:currentStockUpdated}).then(console.log)
    
        let path = 'alimentation';
           console.log(path);
           postgres(path).insert(object).then(console.log)

           





           let object2 = {
            type:"Sortant",
            Mouvement:"alimentation",
            note:note,
            nom:nom,
            date:date_alimentation,
            quantite_produit:(quantit?? * dur??),
            id_exp:req.body.id_exp
        }
        path = "historique_??change";
       console.log(path);
       await postgres(path).insert(object2).then(console.log)


      //data todo

       await postgres('aliment').where({id_aliment:id_aliment}).select('prix_unit').then(data => {prixUnit=data[0].prix_unit ; console.log(data)})

       await postgres('animal').where({id_exploitation:id_exploitation}).count().then(data =>{
        console.log("countAnimal",data[0].count)
        countAnimal = data[0].count
        })


       if(countAnimal){
       var qq =(quantit?? * dur?? * prixUnit) / countAnimal


       var animal;

       await postgres('animal').where({id_exploitation:id_exploitation}).select().then(data =>{
           console.log("countAnimal",data)
           animal = data
           })
           
        for(let i=0;i<animal.length;i++){
            if(animal[i].cout_revien)
           await postgres('animal').where({id_ann:animal[i].id_ann}).update({cout_revien:animal[i].cout_revien+qq})
            else await postgres('animal').where({id_ann:animal[i].id_ann}).update({cout_revien:qq})
        }

        res.json('success') 
       }
       else
       res.json("pas d'animal")

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
        postgres("traitement").where({id_exp:req.body.id_exp}).select()
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


       app.post('/effectuer_traitement',async (req,res)=>{
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
           postgres(path).insert(object).then(console.log)

           var animal;

           await postgres('animal').where({id_ann:1}).select().then(data =>{
               console.log("countAnimal",data)
               animal = data[0].cout_revien
               })
               console.log("hello hello",animal)
                if(animal!=0){
                await postgres('animal').where({id_ann:id_ann}).update({cout_revien:Number(animal)+ Number(cout) })}
                else await postgres('animal').where({id_ann:id_ann}).update({cout_revien:Number(cout)})

                res.json(animal + cout)
           
       })


       app.post('/update_exploitationVeg',(req,res)=>{
        const {errige,source_eau,culture_permanent,note,date_exploitation,nom,type_source_eau,distance_eau,vuln??rable,certification,zone_sp??cifique,syst??me_irrigation,id_exploitation} = req.body;
        let object = {
            errige:errige,
            source_eau:source_eau,
            culture_permanent:culture_permanent,
            note:note,
            date_exploitation:date_exploitation,
            nom:nom,
            type_source_eau:type_source_eau,
            distance_eau:distance_eau,
            vuln??rable:vuln??rable,
            certification:certification,
            zone_sp??cifique:zone_sp??cifique,
            syst??me_irrigation:syst??me_irrigation,
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
            .then( data=>{ console.log("data",data); if(data[0]) {data_id = data[0].id_prod; data_qt =data[0].quantit??}})
            if(data_qt){
                qt_calc = Number(data_qt) + Number(Lait);
            }
            else 
            qt_calc = Lait;
            console.log('ha produit',data_id)
            if(data_id){
                console.log("ha l id mn update",data_id) 
                await postgres('produit').where({id_prod:data_id}).update({quantit??:qt_calc}).then(console.log) 
            }
            else{
                await postgres('produit').returning('id_prod').insert({nom:'Lait',unit??:'l',id_exp:id_exp,quantit??:Lait}).then(data=> { ; console.log("ha l id mn insert",data_id) })
            }
               object['quantit??'] = Lait
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
            let path = "historique_??change";
           console.log(path);
           postgres(path).insert(object2).then(console.log)
            
        }
        if(type === 'Volaille' && Oeuf){
             await postgres('produit').where({nom:'Oeuf',id_exp:id_exp}).select()
            .then( data=>{ console.log("data",data); if(data[0]) {data_id = data[0].id_prod; data_qt =data[0].quantit??}})
            if(data_qt){
                qt_calc = Number(data_qt) + Number(Oeuf);
            }
            else 
            qt_calc = Oeuf;
            console.log('ha produit',data_id)
            if(data_id){
                console.log("ha l id mn update",data_id) 
                await postgres('produit').where({id_prod:data_id}).update({quantit??:qt_calc}).then(console.log) 
            }
            else{
                await postgres('produit').returning('id_prod').insert({nom:'Oeuf',unit??:'Oeuf',id_exp:id_exp,quantit??:Oeuf}).then(data=> { ; console.log("ha l id mn insert",data_id) })
            }
               object['quantit??'] = Oeuf
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
            let path = "historique_??change";
           console.log(path);
           postgres(path).insert(object2).then(console.log)
            
        }

        if(Engrais_naturel){
            console.log("zebi")
            await postgres('engrais').where({nom:'Engrais_naturel',id_exp:id_exp}).select()
           .then( data=>{ console.log("data",data); if(data[0]) {data_id = data[0].id_prod; data_qt =data[0].quantit??}})
           if(data_qt){
               qt_calc = Number(data_qt) + Number(Engrais_naturel);
           }
           else 
           qt_calc = Engrais_naturel;
           console.log('ha produit',data_id)
           if(data_id){
               console.log("ha l id mn update",data_id) 
               await postgres('engrais').where({id_prod:data_id}).update({quantit??:qt_calc}).then(console.log) 
           }
           else{
               await postgres('engrais').returning('id_prod').insert({nom:'Engrais_naturel',unit??:'kg',id_exp:id_exp,quantit??:Engrais_naturel}).then(data=> {data_id = data[0].id_prod; ; console.log("ha l id mn insert",data_id) })
           }
              object['quantit??'] = Engrais_naturel
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
            console.log("historique_??change")
            let path = "historique_??change";
           console.log(path);
           postgres(path).insert(object2).then(console.log)
            

       }

       
    

        
       
        res.json(data_id)

        
 
        
       })


       app.post('/update_Animal',(req,res)=>{
           
        const {id_ann,date_achat,gender,date_birth,race,sous_famille,note,prix} = req.body;
        let object = {
            gender:gender,
            date_birth:date_birth,
            race:race,
            sous_famille:sous_famille,
            note:note,
            prix:prix,
            date_achat:date_achat
    
        }
        let path = 'exploitation_veg';
           console.log(path);
           postgres('animal').where({id_ann:id_ann}).update(object).then(res.json("pathName")).then(console.log)
       })


       app.post('/updateRecolte',(req,res)=>{
        const {quantit??,id_prod} = req.body;

        let object = {
            id_prod:id_prod,
            quantit??:quantit??
    
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
        postgres.raw('select * from produit where (produit.nom = \'Oeuf\' or produit.nom = \'Lait\') AND id_exp = ?',[id_ep])
        .then(
            data =>{ 
                console.log(data.rows)
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
     
     postgres('historique_??change').where({id_exp:id_ep}).select()
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

       app.post('/uploadExploiteur', upload.single('materiel') , (req,res)=>{
        console.log(req.file)
        console.log(req.body.id)
        const Length = req.file.path.split('\\').length;
        const pathName = req.file.path.split('\\')[Length-2]+'\\' + req.file.path.split('\\')[Length-1]
        console.log(pathName)
        console.log(req.body.id)
        
         postgres('exploiteur').where({id:req.body.id}).update({photo:pathName}).then(res.json(pathName)).then(console.log)
        //postgres('materiel').returning('id_mat').insert({image:pathName}).then(data=> console.log({data:data[0]}))
        
 
    })
       app.post('/uploadAnimal', upload.single('materiel') , (req,res)=>{
        console.log(req.file)
        console.log(req.body.id)
        const Length = req.file.path.split('\\').length;
        const pathName = req.file.path.split('\\')[Length-2]+'\\' + req.file.path.split('\\')[Length-1]
        console.log(pathName)
        console.log(req.body.id)
        
         postgres('animal').where({id_ann:req.body.id}).update({photo:pathName}).then(res.json(pathName)).then(console.log)
        //postgres('materiel').returning('id_mat').insert({image:pathName}).then(data=> console.log({data:data[0]}))
        
    })


    app.post('/update_personnel',(req,res)=>{
        const {id_pers,nom,adress,ville,cin,pays,id_exp,VALIDE_DEPUIS,salaire_hr,salaire_mois,salaire_jr,tva,type,niveau_qualification,certiphyto,conseiller,email,t??l??phone,code_insee} = req.body;
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
            t??l??phone:t??l??phone,
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
        const {nom,VALIDE_DEPUIS,prix_hr,description,model,immatriculation,fabriquant,prix_location_jour,propri??taire,derniere_controle_tec,derniere_assurence,n_enregistrement} = req.body;
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
        if(prix_location_jour){path = 'materiel_lou??'; object["prix_location_jour"] =prix_location_jour ;object["propri??taire"] =propri??taire ; console.log(path)};
        if(derniere_controle_tec || n_enregistrement || derniere_assurence){path = 'materiel_achet??'; object["derniere_controle_tec"] =derniere_controle_tec ; object["derniere_assurence"] =derniere_assurence ; object["n_enregistrement"] =n_enregistrement ;console.log(path)};


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
        const {prix_uni,VALIDE_DEPUIS,id_prod,nom,culture,unit??} = req.body;
        let object = {
            prix_uni:prix_uni,
            VALIDE_DEPUIS:VALIDE_DEPUIS,
            nom:nom,
            unit??:unit??,
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
        const {prix_uni,unit??,composition,n_enregistrement,fabriquant,VALIDE_DEPUIS,id_prod,nom,culture} = req.body;
        let object = {
            prix_uni:prix_uni,
            VALIDE_DEPUIS:VALIDE_DEPUIS,
            fabriquant:fabriquant,
            nom:nom,
            unit??:unit??,
            composition:composition,
            n_enregistrement:n_enregistrement
            

        }
         let path = "phytosantaire";
           console.log(path);
           postgres(path).where({id_prod:id_prod}).update(object).then(res.json("pathName")).then(console.log)
       })

       app.post('/updateEngrais',(req,res)=>{
        const {prix_uni,azot,Phosphore,unit??,potassium,composition_n_oligo_elements,composition,n_enregistrement,fabriquantVALIDE_DEPUIS,id_prod,nom,culture} = req.body;
        let object = {
            prix_uni:prix_uni,
            VALIDE_DEPUIS:VALIDE_DEPUIS, 
            nom:nom,
            unit??:unit??,
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
        const {nom,unit??,id_exp ,prix_uni,myProp, n_enregistrement,composition,fabriquant, culture, azote,phosphore,potassium,composition_n_oligo_elements} = req.body;
    
        let object = {
            nom:nom,
            unit??:unit??,
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
        const {dur??,note,prix_totale,travaux,id_exp} = req.body;
        let object ={
            dur??:dur??,
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
                    if(data0[i].prod) data0[i].prod = data0[i].prod + ' , ' + 'produit :'+data4[f].nom + ' quantit?? :'+data4[f].quantite + data4[f].unit??
                    else data0[i].prod = 'produit :'+data4[f].nom + ' quantit?? :'+data4[f].quantite + data4[f].unit??
                    
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
       var dataFns = []
        var data2 = []
        var data3 = []
        var data4 = []
        var data4sem = []
        var data4phyto = []
        var data4Eng = []
        var data0 = []
        var dataCulture = []
       

    await postgres("operation").where({id_exp:req.body.id_exp}).select().then(data => {data0 = data})
    await postgres.raw('select *,exp.nom AS nomFoncier from operation o,exploitation exp, utilise_prod produ, semence_plants prod,appliquer_op app  where o.id_operation = produ.id_operation and o.id_operation = app.id_operation and exp.id_exploitation = app.id_exploitation and produ.id_prod = prod.id_prod And o.id_exp=?',[req.body.id_exp])
    .then(
        data =>{ 

            dataCulture = data.rows
        
        })

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
            console.log("hello bro",data2)
        
        })
        //todo
        await postgres.raw('select * from foncier f  where f.id_exp=?',[id_exp])
        .then(
        data =>{ 
   
            dataFns = data.rows
        
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
                    if(data0[i].matPrice) data0[i].matPrice = Number(data0[i].matPrice) + Number(data1[j].prix_hr)*(Number(data0[i].dur??.split(':')[0]) +Number(data0[i].dur??.split(':')[1])/60 )
                    else data0[i].matPrice = Number(data1[j].prix_hr)*(Number(data0[i].dur??.split(':')[0]) +Number(data0[i].dur??.split(':')[1])/60 )
                }
            }
            for (let k = 0 ; k<data2.length ; k++){
                if(data2[k].id_operation === data0[i].id_operation){
                    console.log(data2[i])
                    if(data0[i].nomFoncier) data0[i].nomFoncier = data0[i].nomFoncier +" , "+ data2[k].nom  
                      
                    else data0[i].nomFoncier =''+ data2[k].nom 

                    if(!data0[i].date_application) data0[i].date_application = data2[k].date_application
                 
                    

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
                   { if(data0[i].operateur) data0[i].operateur = Number(data0[i].operateur) + Number(data3[l].salaire_hr )*(Number(data0[i].dur??.split(':')[0]) +Number(data0[i].dur??.split(':')[1])/60 )
                    else data0[i].operateur = Number(data3[l].salaire_hr )*(Number(data0[i].dur??.split(':')[0]) +Number(data0[i].dur??.split(':')[1])/60 )
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
    for(let i=0; i<data0.length ; i++){
        if(!data0[i].date_application){
            data0.splice((i), 1)
            i--
        }
    }


    //todo date
    var dateTo = format(new Date(), 'dd/MM/yyyy');
    var dateFrom = SousDays(req.body.duration);
    console.log('dateTo',dateTo)
    console.log('dateFrom',dateFrom)
    for(let i=0; i<data0.length ; i++){
        
        var dateCheck = format(new Date(data0[i].date_application), 'dd/MM/yyyy')


        var d1 = dateFrom.split("/");
        var d2 = dateTo.split("/");
        var c = dateCheck.split("/");

        var from = new Date(d1[2], parseInt(d1[1])-1, d1[0]);  // -1 because months are from 0 to 11
        var to   = new Date(d2[2], parseInt(d2[1])-1, d2[0]);
        var check = new Date(c[2], parseInt(c[1])-1, c[0]);

        if(!(check > from && check < to)){
            console.log(i,check > from && check < to)
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
                    //culture:data0[i].culture
                }
                data0.push(object)
         
                
            }

            data0[i].nomFoncier =data0[i].nomFoncier.split(' , ')[0]
            data0[i].Eng = data0[i].Eng *( Number(myNewObject[data0[i].nomFoncier.split(' , ')[0]])/Number(data0[i].surface))
            data0[i].Phy = Number(data0[i].Phy) *( Number(myNewObject[data0[i].nomFoncier.split(' , ')[0]])/Number(data0[i].surface))
            data0[i].operateur =data0[i].operateur *( Number(myNewObject[data0[i].nomFoncier.split(' , ')[0]])/Number(data0[i].surface))
            data0[i].matPrice = data0[i].matPrice *( Number(myNewObject[data0[i].nomFoncier.split(' , ')[0]])/Number(data0[i].surface))
            //data0[i].culture=data0[i].culture
            
           }
           
        
        }




    

    
//bon
    

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
            // if(data0[i].culture && data0[j].culture){
            //     data0[i].culture = data0[i].culture+ ", " + data0[j].culture
            // }
            // if(!data0[i].culture && data0[j].culture){
            //     data0[i].culture =  data0[j].culture
            // }

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


 var coutFix = ecart_mois(dateTo,dateFrom)


 var CoutFixdata=[]

 await postgres.raw('select *,exp.nom as name ,cout.nom as nomCout  from cout_fix cout, exploitation exp where exp.id_exploitation = cout.id_exploitation and cout.id_exp=?',[id_exp]).then(data=>{console.log(data); CoutFixdata = data.rows})
 for(let j = 0;j<data0.length;j++){
 for(i=0 ;i<CoutFixdata.length;i++){
     if(CoutFixdata[i].nom === data0[j].nomFoncier){
        if(data0[j].priceTot) data0[j].priceTot= Number(data0[j].priceTot) + Number(CoutFixdata[i].montant) * coutFix
        else data0[j].priceTot = Number(CoutFixdata[i].montant) * coutFix
     }
 }
}

 for(let j = 0;j<data0.length;j++){
 for(i=0 ;i<dataFns.length;i++){
     if(dataFns[i].nom === data0[j].nomFoncier){
        if(!data0[j].surfaceOcup??) data0[j].surfaceOcup??= Number(dataFns[i].surface)
        
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
     if(data0[i].priceTot && data0[i].recolt)data0[i].Roi = (-(data0[i].recolt+data0[i].priceTot )/data0[i].priceTot)*100
     else data0[i].Roi= 0
     if(data0[i].recolt) data0[i].margeNet = Number(data0[i].recolt) + data0[i].priceTot
     else data0[i].margeNet =  data0[i].priceTot
 }

//todo


 

for(let i = 0;i<data0.length;i++){
    for (let f = 0 ; f<dataCulture.length ; f++){
        if(dataCulture[f].nomfoncier === data0[i].nomFoncier){
            
            if(dataCulture[f].date_application){
                console.log("web")
            if(chequeDate(req.body.duration,AddDays(dataCulture[f].date_application)) || chequeDateIsBiger(AddDays(dataCulture[f].date_application))){
                
                if(dataCulture[f].culture) {
            if(!data0[i].culture) data0[i].culture = dataCulture[f].culture
            else  data0[i].culture =  data0[i].culture +", " +dataCulture[f].culture
            
            
            }
        }}
        }
    }
    }

    if(req.body.hectar === "DH/ha"){
        for(let i= 0; i<data0.length;i++){
            data0[i].Eng =  data0[i].Eng / data0[i].surfaceOcup??
            data0[i].operateur =  data0[i].operateur / data0[i].surfaceOcup??
            data0[i].recolt =  data0[i].recolt / data0[i].surfaceOcup??
            data0[i].priceTot =  data0[i].priceTot / data0[i].surfaceOcup??
            data0[i].Entrant =  data0[i].Entrant / data0[i].surfaceOcup??
            data0[i].margeNet =  data0[i].margeNet / data0[i].surfaceOcup??
            data0[i].Phy =  data0[i].Phy / data0[i].surfaceOcup??
            data0[i].Sem =  data0[i].Sem / data0[i].surfaceOcup??
            data0[i].matPrice =  data0[i].matPrice / data0[i].surfaceOcup??
            data0[i].Roi = (-(data0[i].recolt+data0[i].priceTot )/data0[i].priceTot)*100

        }
        
    }







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

    postgres.raw('select *,exp.nom AS nomFoncier from operation o,exploitation exp, utilise_prod produ, semence_plants prod,appliquer_op app  where o.id_operation = produ.id_operation and o.id_operation = app.id_operation and exp.id_exploitation = app.id_exploitation and produ.id_prod = prod.id_prod And o.id_exp=?',[req.body.id_exp])
    .then(
        data =>{ 

            res.send(data )
        
        })
   })
   
    
   
   app.post('/getOperation1',async(req,res)=>{
    await  postgres.raw('select * from operation o, utilise_prod produ, semence_plants prod,appliquer_op app where o.id_operation = produ.id_operation and o.id_operation = app.id_operation and produ.id_prod = prod.id_prod And o.id_exp=?',[req.body.id_exp])
    .then(
        data =>{ 

            res.json(data.rows)
        })
    


   



    
   })

  

   app.post('/getOperation3',(req,res)=>{
       //let date = req.body.date
      // let neee = format(new Date(date), 'dd/MM/yyyy')


      

      const dateTo = format(new Date(), 'dd/MM/yyyy');
      
      let dateFrom = SousDays(7)

      res.send(dateFrom)







        var d1 = dateFrom.split("/");
        var d2 = dateTo.split("/");
        var c = dateCheck.split("/");

        var from = new Date(d1[2], parseInt(d1[1])-1, d1[0]);  // -1 because months are from 0 to 11
        var to   = new Date(d2[2], parseInt(d2[1])-1, d2[0]);
        var check = new Date(c[2], parseInt(c[1])-1, c[0]);

        console.log(check > from && check < to)

       //res.send(neee)
   })
   

   app.get('/getOperation4',(req,res)=>{

    
    res.send(AddDays("2021-11-24T23:00:00.000Z"))
   })
   app.post('/handleMouvement',(req,res)=>{
    let {type,id_prod,date,n_facture,Mouvement,quantite,num??ro_de_lot,client,note,currentStock,nom,id_aliment,Exploitation} = req.body;
    let object = {
        type:type,
        Mouvement:Mouvement,
        n_facture:n_facture,
        num??ro_de_lot:num??ro_de_lot,
        client:client,
        note:note,
        nom:nom,
        date:date,
        quantite_produit:quantite,
        id_exp:req.body.id_exp
    }
    if(type === 'Entrant' && Mouvement !== "Op??ration" && Exploitation==='V??g??tal'){
       
        if(currentStock)currentStock = Number(currentStock) + Number(quantite)
        if(!currentStock) currentStock = Number(quantite)
        postgres("produit").where({id_prod:id_prod}).update({quantit??:currentStock}).then(console.log)
    }

    if(type === 'Entrant' && Mouvement !== "Op??ration" && Exploitation==='Animal'){
       
        if(currentStock)currentStock = Number(currentStock) + Number(quantite)
        if(!currentStock) currentStock = Number(quantite)

        postgres("aliment").where({id_aliment:id_aliment}).update({quantite:currentStock, date_achat:date}).then(console.log)
    }
    if(type === 'Sortant' && Mouvement !== "Op??ration" && Exploitation==='V??g??tal'){
        currentStock = Number(currentStock) - Number(quantite)
        postgres("rr").where({id_prod:id_prod}).update({quantit??:currentStock}).then(console.log)
    }
    if(type === 'Sortant' && Mouvement !== "Op??ration" && Exploitation==='Animal'){
        currentStock = Number(currentStock) - Number(quantite)
        postgres("produit").where({id_prod:id_prod}).update({quantit??:currentStock}).then(console.log)
    }

     let path = "historique_??change";
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
        
        postgres("produit").where({id_prod:field}).update({quantit??:misajour}).then(console.log)
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
        let path = "historique_??change";
       console.log(path);
       postgres(path).insert(object).then(res.send("success")).then(console.log)
      
  })


     
   })

   app.post('/calculePrix',async (req,res)=>{
    let {id_exploitation , id_ann} = req.body;
    var coutTrait;
    var prix_achat;
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


        await postgres('animal').where({id_exploitation:id_exploitation}).count().then(data =>{
            console.log("countAnimal",data[0].count)
            countAnimal = data[0].count
            })

            

            if(countAnimal != 0){prix = coutTrait + prix_achat }
            else prix = coutTrait + prix_achat;
       res.json(prix)

   })

   app.post('/Rapport_resultAnimal',async (req,res)=>{
    const  {id_exploitation , id_ann,id_exp} = req.body;
    var exploitation_ann = [];
    var coutFix;
    var animal;
    var produire;
    var traitements;
    var alimentation ;





        let path = "effectuer_traitement";
       console.log(path);

       

       await postgres.raw('select * from foncier f , exploitation_ann exp where exp.id_foncier = f.id_foncier and f.id_exp=?',[id_exp]).then(data=>{console.log(data.rows); exploitation_ann = data.rows  })
       

       await postgres('animal').select().then(data =>{
        console.log("prix_achat")
        animal = data
        })

       await postgres('cout_fix').where({id_exp:id_exp }).select().then(data =>{
        console.log("prix_achat")
        coutFix = data
        })
       //animal prix d'achat 
       for(let i= 0; i<exploitation_ann.length;i++){
        var cout = 0;
           for( let j=0;j<animal.length;j++){
               if(animal[j].id_exploitation == exploitation_ann[i].id_exploitation ){
                   
                   if(animal[j].prix && animal[j].date_achat && chequeDate(req.body.duration,animal[j].date_achat)) cout += (animal[j].prix) //date achat
               }
               exploitation_ann[i].prixtot = -cout

           }
       }

       //animal traitement 
       await postgres.raw('select * from animal an , effectuer_traitement tr where an.id_ann = tr.id_ann ').then(data=>{console.log(data.rows); traitements = data.rows  })

       for(let i= 0; i<exploitation_ann.length;i++){
        var cout = 0;
           for( let j=0;j<traitements.length;j++){
               if(traitements[j].id_exploitation == exploitation_ann[i].id_exploitation ){
                   
                   if(traitements[j].cout && traitements[j].date_traitement && chequeDate(req.body.duration,traitements[j].date_traitement)) {cout += (traitements[j].cout) ; console.log(traitements[j].date_traitement )}//date achat
               }
               exploitation_ann[i].prixtot += -cout
               exploitation_ann[i].traitements = -cout

           }



       }

       //animal traitement 
       await postgres.raw('select * from alimentation ').then(data=>{console.log(data.rows); alimentation = data.rows  })

       for(let i= 0; i<exploitation_ann.length;i++){
        var cout = 0;
           for( let j=0;j<alimentation.length;j++){
               if(alimentation[j].id_exploitation == exploitation_ann[i].id_exploitation ){
                   
                   if(alimentation[j].price && alimentation[j].date_alimentation && chequeDate(req.body.duration,alimentation[j].date_alimentation)) {cout += alimentation[j].price }//date achat
               }
               exploitation_ann[i].prixtot += -cout
               exploitation_ann[i].alimentation = -cout

           }



       }



      

       
       var dateFrom = SousDays(req.body.duration);
       var dateTo = format(new Date(), 'dd/MM/yyyy');
       var coutFix = ecart_mois(dateTo,dateFrom);
       //Cout fix date?
       for(let i= 0; i<exploitation_ann.length;i++){
           var cfix = 0;
           for(let c = 0; c< coutFix.length; c++ ){
               if(coutFix[c].id_exploitation == exploitation_ann[i].id_exploitation ){
                    if(coutFix[c].montant) cfix += (coutFix[c].montant * coutFix)
               }
               
           }
           exploitation_ann[i].prixtot += cfix
        }


        // quantite Oufs Lait Engrais_naturel
        await postgres.raw('select * from produire pr , produit  where pr.id_prod = produit.id_prod and produit.id_exp=?',[id_exp]).then(data=>{console.log(data.rows); produire = data.rows  })
        var eggs = 0;
        var Lait = 0;
        var Engrais = 0;
        var produit = 0;
       //todo
        for(let i= 0; i<exploitation_ann.length;i++){
             eggs = 0;
             Lait = 0;
             Engrais = 0;
             produit = 0;
            for(let c = 0; c< produire.length; c++ ){
                if(produire[c].id_exploitation == exploitation_ann[i].id_exploitation ){
                     if(produire[c].quantit?? && produire[c].nom === 'Oeuf' &&   chequeDate(req.body.duration,produire[c].date) ) {eggs += produire[c].quantit?? ; if(produire[c].prix_uni) {produit +=( produire[c].quantit?? * produire[c].prix_uni )} }
                     if(produire[c].quantit?? && produire[c].nom === 'Lait' &&   chequeDate(req.body.duration,produire[c].date) ) {Lait += produire[c].quantit??  ; if(produire[c].prix_uni) {produit +=( produire[c].quantit?? * produire[c].prix_uni )}   }
                     if(produire[c].quantit?? && produire[c].nom === 'Engrais_naturel' &&   chequeDate(req.body.duration,produire[c].date) ){ Engrais += produire[c].quantit?? ;  if(produire[c].prix_uni) {produit +=( produire[c].quantit?? * produire[c].prix_uni )} }
                     
                }
                
            }
            exploitation_ann[i].eggs = eggs
            exploitation_ann[i].Lait = Lait
            exploitation_ann[i].Engrais = Engrais
            exploitation_ann[i].Produit = produit
            if(exploitation_ann[i].Produit !=0 && exploitation_ann[i].prixtot !=0){exploitation_ann[i].margeNet =  Number(exploitation_ann[i].Produit) + Number(exploitation_ann[i].prixtot)}
            if(exploitation_ann[i].prixtot !=0){ exploitation_ann[i].Roi = ((exploitation_ann[i].Produit-exploitation_ann[i].prixtot )/exploitation_ann[i].prixtot)*100}
            console.log("ello ello" + exploitation_ann[i].id_exploitation , exploitation_ann[i].Produit , exploitation_ann[i].prixtot)
         }


        






    






       res.json(exploitation_ann)
        
   })


   function chequeDate(duration , date){
    var dateTo = format(new Date(), 'dd/MM/yyyy');
    var dateFrom = SousDays(duration);

    console.log("------------------")
    console.log('dateTo',dateTo)
    console.log('dateFrom',dateFrom)
    
    
        
        var dateCheck = format(new Date(date), 'dd/MM/yyyy')
        console.log('dateCheck',dateCheck)

        var d1 = dateFrom.split("/");
        var d2 = dateTo.split("/");
        var c = dateCheck.split("/");

        var from = new Date(d1[2], parseInt(d1[1])-1, d1[0]);  // -1 because months are from 0 to 11
        var to   = new Date(d2[2], parseInt(d2[1])-1, d2[0]);
        var check = new Date(c[2], parseInt(c[1])-1, c[0]);

        if(!(check > from && check < to)){
            return false

        }
        return true

        

    
   }
   function chequeDateIsBiger(date2){
    var dateTo = format(new Date(date2), 'dd/MM/yyyy');
    var dateFrom = format(new Date(), 'dd/MM/yyyy');


    
    console.log('dateTo',dateTo)
    console.log('dateFrom',dateFrom)
    
        


        var d1 = dateFrom.split("/");
        var d2 = dateTo.split("/");
        

        var from = new Date(d1[2], parseInt(d1[1])-1, d1[0]);  // -1 because months are from 0 to 11
        var to   = new Date(d2[2], parseInt(d2[1])-1, d2[0]);
        

        if(!(to > from)){
            return false

        }
        return true

   }


   app.post('/deleteMat',async (req,res)=>{
       var option =false 
   await postgres('besoin_mat').where({id_mat:req.body.id}).then(data =>{if(data !=0){option = true} })
   if(option === false){
     postgres('materiel')
    .where({id_mat:req.body.id})
    .del().then(data => res.json(data)).then(console.log)}
    else res.json("error")
   })

   app.post('/deletePers',async (req,res)=>{
       var option =false
   await postgres('realise_trav').where({id_pers:req.body.id_pers}).then(data =>{if(data !=0){option = true} })
   if(option === false){
     postgres('personnel')
    .where({id_pers:req.body.id_pers})
    .del().then(data => res.json(data)).then(console.log)}
    else res.json("error")
   })

   app.post('/deleteExpAnn',async (req,res)=>{
       var option =false 
    await postgres('exploitation_ann')
    .where({id_foncier:req.body.id_foncier})
    .del().then(console.log)

    
     postgres('foncier')
    .where({id_foncier:req.body.id_foncier})
    .del().then(data => res.json(data)).then(console.log)
  
   })
   
   app.post('/deleteProdveg',async (req,res)=>{
       var option =false 
    await postgres('exploitation_veg')
    .where({id_foncier:req.body.id_foncier})
    .del().then(console.log)

    
     postgres('foncier')
    .where({id_foncier:req.body.id_foncier})
    .del().then(data => res.json(data)).then(console.log)
  
   })


   app.post('/DeleteAnn',async (req,res)=>{
       var option =false 
    await postgres('animal')
    .where({id_ann:req.body.id_ann})
    .del().then(data => res.json(data)).then(console.log)
   })   


app.listen(3001, ()=>{
    console.log('app is runing on port 3001');
})
