import React, { useState } from "react";
import { Alert, FlatList, StyleSheet, View, Text, Button, SafeAreaView, ActivityIndicator, TextInput, ScrollView } from "react-native";
import { Keyboard } from 'react-native';
import * as SQLite from 'expo-sqlite';
import axios from "axios";

export default ApiContainer = () => {
  const [loading, setLoading] = useState(false)
  const [cepUsuario, setCEPUsuario] = useState(null)
  const [fromAxios, setFromAxios] = useState(false)
  const [bairro, setBairro] = useState(null);
  const [cep, setCEP] = useState(null);
  const [complemento, setComplemento] = useState(null);
  const [ddd, setDdd] = useState(null);
  const [gia, setGia] = useState(null);
  const [ibge, setIbge] = useState(null);
  const [localidade, setLocalidade] = useState(null);
  const [logradouro, setLogradouro] = useState(null);
  const [siafi, setSiafi] = useState(null);
  const [uf, setUf] = useState(null);
  const [empty, setEmpty] = useState([]);
  const [items, setItems] = useState([]);
  const [operacao, setOperacao] = useState(false);
  const db = SQLite.openDatabase("endereco.db");

  db.transaction((tx) => {
    tx.executeSql("create table " +
      "if not exists endereco (indice INTEGER PRIMARY KEY AUTOINCREMENT, " +
      " cep text);");
  });

  const setEndereco = (json) => {
    setCEP(json.cep);
    setBairro(json.bairro);
    setComplemento(json.complemento);
    setDdd(json.ddd);
    setGia(json.gia);
    setIbge(json.ibge);
    setLocalidade(json.localidade);
    setLogradouro(json.logradouro);
    setSiafi(json.siafi);
    setUf(json.uf);
    setIbge(json.ibge);
    setFromAxios(true);
    salvarEndereco(json.cep);
  }

  const goAPICEP = () => {
    setFromAxios(false);
    setLoading(true);

    axios.get(`https://viacep.com.br/ws/${cepUsuario}/json`)
      .then(response => {
        console.log(response.data);
        setTimeout(() => {
          setLoading(false);
          setEndereco(response.data);
          setFromAxios(true);
          Keyboard.dismiss();
          setOperacao(false);
        }, 2000)
      })
      .catch(error => {
        console.log(error);
      });
  }

  const listarEndereco = async () => {
    console.log('listarEndereco');
    setOperacao(true);
    setFromAxios(false);
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM endereco order by indice',
        [],
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
            setItems(temp);
            console.log(temp);
            if (results.rows.length >= 1) {
              setEmpty(false);
            } else {
              setEmpty(true)
            }
          }
        }
      );
    });
  }

  const apagarTabela = () => {
    db.transaction((tx) => {
      tx.executeSql("drop table if exists endereco;");
    });
    setEmpty(true);
    setItems(null);
  }



  const salvarEndereco = (cepParametro) => {
    console.log('salvarEndereco');
    db.transaction(
      (tx) => {
        tx.executeSql('INSERT INTO endereco (cep) VALUES (?)',
          [cepParametro], (resultSet) => {
            Alert.alert("Alerta", "Histórico de busca registrado");
          }, (error) => {
            console.log(error);
          }
        )
      }
    );
    setEmpty(false);
  };



  const separadorItem = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#000'
        }}
      />
    );
  };

  const mensagemVazia = (status) => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Text style={{ fontSize: 25, textAlign: 'center' }}>Nenhum registro
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ top: 30 }}>
      <View style={{ margin: 18 }}>
        <TextInput
          style={{ margin: 18 }}
          onChangeText={(value) => setCEPUsuario(value)}
          placeholder="Entre com o CEP"
        />
        <Button
          title={'Buscar o endereço'}
          onPress={() => { goAPICEP() }}
          color='green'
        />
        <Button
          title={'Listar os endereços'}
          onPress={() => { listarEndereco() }}
          color='green'
        />
      </View>

      {
        operacao?
        <View style={{ margin: 18 }}>
          {empty ? mensagemVazia(empty) :
            <FlatList
              data={items}
              ItemSeparatorComponent={separadorItem}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) =>
                <View key={item.indice} style={styles.container}>
                  <Text style={styles.itemsStyle}> {item.indice}) {item.cep}</Text>
                </View>
              }
            />
          }
        </View>
      : ""
        }

      {fromAxios ?
        <View>
          <Text style={{ margin: 18 }}>CEP:{cep}</Text>
          <Text style={{ margin: 18 }}>Bairro:{bairro}</Text>
          <Text style={{ margin: 18 }}>Logradouro:{logradouro}</Text>
          <Text style={{ margin: 18 }}>Complemento:{complemento}</Text>
          <Text style={{ margin: 18 }}>Localidade:{localidade}</Text>
          <Text style={{ margin: 18 }}>GIA:{gia}</Text>
          <Text style={{ margin: 18 }}>IBGE:{ibge}</Text>
          <Text style={{ margin: 18 }}>Siafi:{siafi}</Text>
          <Text style={{ margin: 18 }}>DDD:{ddd}</Text>
          <Text style={{ margin: 18 }}>UF:{uf}</Text>
        </View>
        :
        <Text style={{ margin: 18 }}></Text>
      }
      {loading &&
        <View>
          <Text style={{ fontSize: 16, color: 'red', margin: 18 }}>Carregando...</Text>
          <ActivityIndicator size="large" color="red" />
        </View>
      }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    marginTop: 5,
    padding: 5,
  },
});