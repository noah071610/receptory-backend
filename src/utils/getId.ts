import { customAlphabet, urlAlphabet } from 'nanoid';

export default function getId() {
  const nanoid = customAlphabet(urlAlphabet, 15);
  return nanoid();
}
