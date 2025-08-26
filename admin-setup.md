# Admin Kurulumu

Admin paneli oluşturuldu. İlk admin kullanıcısı oluşturmak için:

## Yöntem 1: Firestore Konsolu
1. [Firebase Console](https://console.firebase.google.com/) açın
2. Projenizi seçin
3. Firestore Database'e gidin
4. `users` koleksiyonunda admin yapmak istediğiniz kullanıcıyı bulun
5. Kullanıcı dokümanını düzenleyin
6. `isAdmin` alanını `true` yapın

## Yöntem 2: Manuel
Şu anda varsayılan olarak tüm kullanıcılar normal kullanıcıdır. İlk admin kullanıcı oluşturduktan sonra admin paneli üzerinden diğer kullanıcıları yönetebilirsiniz.

## Admin Panel Özellikleri
- **URL**: `/admin`
- **Bekleyen İlanlar**: Admin onayı bekleyen ilanları görüntüleme ve onaylama/reddetme
- **Onaylanan İlanlar**: Aktif ilanları görüntüleme
- **Reddedilen İlanlar**: Reddedilmiş ilanları görüntüleme
- **Admin Notları**: İlan onaylama/reddetme sırasında not ekleme

## Kullanıcı Deneyimi
- Kullanıcılar ilan eklediklerinde durum `pending` olarak ayarlanır
- İlanlar admin onayından sonra `aktif` duruma geçer
- Kullanıcı profilinde bekleyen, aktif, reddedilen ilanlar ayrı sekmelerde görünür
- Header'da admin kullanıcılar için "Admin" butonu görünür