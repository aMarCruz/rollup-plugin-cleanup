function AES() {
}

AES.prototype._prepare = function() {

  var rounds = numberOfRounds[this.key.length];
  if (rounds == null) {
      throw new Error('invalid key size (must be 16, 24 or 32 bytes)');
  }

  // encryption round keys
  this._Ke = [];

  // decryption round keys
  this._Kd = [];

  for (var i = 0; i <= rounds; i++) {
      this._Ke.push([0, 0, 0, 0]);
      this._Kd.push([0, 0, 0, 0]);
  }

  var roundKeyCount = (rounds + 1) * 4;
  var KC = this.key.length / 4;

  // convert the key into ints
  var tk = convertToInt32(this.key);

  // copy values into round key arrays
  var index;
  for (var i = 0; i < KC; i++) {
      index = i >> 2;
      this._Ke[index][i % 4] = tk[i];
      this._Kd[rounds - index][i % 4] = tk[i];
  }

  // key expansion (fips-197 section 5.2)
  var rconpointer = 0;
  var t = KC, tt;
  while (t < roundKeyCount) {
      tt = tk[KC - 1];
      tk[0] ^= ((S[(tt >> 16) & 0xFF] << 24) ^
                (S[(tt >>  8) & 0xFF] << 16) ^
                (S[ tt        & 0xFF] <<  8) ^
                 S[(tt >> 24) & 0xFF]        ^
                (rcon[rconpointer] << 24));
      rconpointer += 1;

      // key expansion (for non-256 bit)
      if (KC != 8) {
          for (var i = 1; i < KC; i++) {
              tk[i] ^= tk[i - 1];
          }

      // key expansion for 256-bit keys is "slightly different" (fips-197)
      } else {
          for (var i = 1; i < (KC / 2); i++) {
              tk[i] ^= tk[i - 1];
          }
          tt = tk[(KC / 2) - 1];

          tk[KC / 2] ^= (S[ tt        & 0xFF]        ^
                        (S[(tt >>  8) & 0xFF] <<  8) ^
                        (S[(tt >> 16) & 0xFF] << 16) ^
                        (S[(tt >> 24) & 0xFF] << 24));

          for (var i = (KC / 2) + 1; i < KC; i++) {
              tk[i] ^= tk[i - 1];
          }
      }

      // copy values into round key arrays
      var i = 0, r, c;
      while (i < KC && t < roundKeyCount) {
          r = t >> 2;
          c = t % 4;
          this._Ke[r][c] = tk[i];
          this._Kd[rounds - r][c] = tk[i++];
          t++;
      }
  }

  // inverse-cipher-ify the decryption round key (fips-197 section 5.3)
  for (var r = 1; r < rounds; r++) {
      for (var c = 0; c < 4; c++) {
          tt = this._Kd[r][c];
          this._Kd[r][c] = (U1[(tt >> 24) & 0xFF] ^
                            U2[(tt >> 16) & 0xFF] ^
                            U3[(tt >>  8) & 0xFF] ^
                            U4[ tt        & 0xFF]);
      }
  }
}
